import React, { useState, useEffect, useRef } from 'react';

// Render a handcrafted SVG map with named continents.
export default function InteractiveWorldMap() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({ text: '', x: 0, y: 0, visible: false });
  const [active, setActive] = useState<string | null>(null);
  const [editMasksMode, setEditMasksMode] = useState(false);

  
  // vertex dragging
  const vertexDragRef = useRef<{ maskId: string; vertexIndex: number } | null>(null);

  type Point = { xPct: number; yPct: number };
  type Mask = { id: string; name: string; points: Point[] };
  const [masks, setMasks] = useState<Record<string, Mask>>(() => {
    try { const raw = localStorage.getItem('map-masks'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const [selectedMask, setSelectedMask] = useState<string | null>(null);
  const [maskEditAction, setMaskEditAction] = useState<'move' | 'add' | 'delete'>('move');
  const [selectedVertex, setSelectedVertex] = useState<{ maskId: string; idx: number } | null>(null);
  const [multiAddMode, setMultiAddMode] = useState(false);
  const [tempAddPoints, setTempAddPoints] = useState<Point[]>([]);

  const onEnter = (name: string) => (e: React.MouseEvent) => {
    setActive(name);
    setTooltip({ text: name, x: e.clientX + 12, y: e.clientY + 12, visible: true });
  };
  const onMove = (e: React.MouseEvent) => setTooltip(t => ({ ...t, x: e.clientX + 12, y: e.clientY + 12 }));
  const onLeave = () => { setActive(null); setTooltip(t => ({ ...t, visible: false })); };

  const startDragOverlay = (e: React.PointerEvent, id: string) => {
  // overlay drag removed - function kept as noop in case called elsewhere
  return;
  };

  // mask vertex handlers
  const startDragVertex = (e: React.PointerEvent, maskId: string, idx: number) => {
    if (!editMasksMode) return;
    e.preventDefault();
    vertexDragRef.current = { maskId, vertexIndex: idx };
    setSelectedVertex({ maskId, idx });

    // attach window-level listeners so dragging continues even if pointer leaves the circle
    const onMove = (ev: PointerEvent) => {
      // reuse move logic
      const mapEl = document.querySelector('.interactive-svg-wrapper') as HTMLElement | null;
      if (!mapEl || !vertexDragRef.current) return;
      const bounds = (mapEl.querySelector('svg') as SVGSVGElement).getBoundingClientRect();
      const x = ev.clientX - bounds.left;
      const y = ev.clientY - bounds.top;
      const xPct = Math.max(0, Math.min(100, (x / bounds.width) * 100));
      const yPct = Math.max(0, Math.min(100, (y / bounds.height) * 100));
      const { maskId: mId, vertexIndex } = vertexDragRef.current;
      setMasks(prev => {
        const m = prev[mId];
        if (!m) return prev;
        const newPoints = m.points.map((p, i) => i === vertexIndex ? { xPct, yPct } : p);
        return { ...prev, [mId]: { ...m, points: newPoints } };
      });
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      vertexDragRef.current = null;
      setSelectedVertex(null);
      try { localStorage.setItem('map-masks', JSON.stringify(masks)); } catch {}
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // moveVertex/endDrag handled by window listeners attached in startDragVertex; keep no-op functions for event props
  const moveVertex = (_e: React.PointerEvent) => { /* noop, window handles movement */ };
  const endDragVertex = (_e: React.PointerEvent) => { /* noop, window handles up */ };

  // helpers: coordinate conversions and geometry
  const clientToPct = (clientX: number, clientY: number) => {
    const mapEl = document.querySelector('.interactive-svg-wrapper') as HTMLElement | null;
    if (!mapEl) return null;
    const svg = mapEl.querySelector('svg') as SVGSVGElement | null;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    return { xPct: Math.max(0, Math.min(100, (x / bounds.width) * 100)), yPct: Math.max(0, Math.min(100, (y / bounds.height) * 100)), pxX: x, pxY: y, svgW: bounds.width, svgH: bounds.height };
  };

  const pctToSvg = (p: Point) => ({ x: (p.xPct / 100) * 1000, y: (p.yPct / 100) * 600 });

  const distPointToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx; const dy = py - yy; return Math.sqrt(dx * dx + dy * dy);
  };

  const centroidOf = (pts: Point[]) => {
    if (!pts || pts.length === 0) return { x: 0, y: 0 };
    const sum = pts.reduce((acc, p) => ({ x: acc.x + (p.xPct / 100) * 1000, y: acc.y + (p.yPct / 100) * 600 }), { x: 0, y: 0 });
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  const themeColorForName = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('luminah')) return '#ffb84d'; // orange/gold
    if (n.includes('silvanum')) return '#29a745'; // green
    if (n.includes('aquario')) return '#4da6ff'; // light blue
    if (n.includes('akeli')) return '#1f7fbf'; // akeli blue
    if (n.includes('ferros')) return '#9aa0a6'; // steel gray
    return '#ffd77a';
  };

  // add vertex at nearest segment of currently selected mask
  const addVertexAtClient = (clientX: number, clientY: number) => {
    if (!selectedMask) return;
    const coords = clientToPct(clientX, clientY);
    if (!coords) return;
    const mask = masks[selectedMask];
    if (!mask) return;
    const ptPx = { x: coords.pxX * (1000 / coords.svgW), y: coords.pxY * (600 / coords.svgH) };
    let bestIdx = 0; let bestDist = Infinity;
    for (let i = 0; i < mask.points.length; i++) {
      const j = (i + 1) % mask.points.length;
      const p1 = pctToSvg(mask.points[i]);
      const p2 = pctToSvg(mask.points[j]);
      const d = distPointToSegment(ptPx.x, ptPx.y, p1.x, p1.y, p2.x, p2.y);
      if (d < bestDist) { bestDist = d; bestIdx = j; }
    }
    // insert before bestIdx
    const newPt: Point = { xPct: coords.xPct, yPct: coords.yPct };
    setMasks(prev => {
      const cur = prev[selectedMask]; if (!cur) return prev;
      const pts = [...cur.points.slice(0, bestIdx), newPt, ...cur.points.slice(bestIdx)];
      const next = { ...prev, [selectedMask]: { ...cur, points: pts } };
      try { localStorage.setItem('map-masks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const deleteNearestVertexAtClient = (clientX: number, clientY: number) => {
    if (!selectedMask) return;
    const coords = clientToPct(clientX, clientY);
    if (!coords) return;
    const mask = masks[selectedMask]; if (!mask) return;
    const ptPx = { x: coords.pxX * (1000 / coords.svgW), y: coords.pxY * (600 / coords.svgH) };
    let bestIdx = -1; let bestDist = Infinity;
    for (let i = 0; i < mask.points.length; i++) {
      const p = pctToSvg(mask.points[i]);
      const dx = p.x - ptPx.x; const dy = p.y - ptPx.y; const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    // if within 18px, remove
    if (bestIdx >= 0 && bestDist < 18) {
      setMasks(prev => {
        const cur = prev[selectedMask]; if (!cur) return prev;
        if (cur.points.length <= 3) return prev; // keep min 3
        const pts = cur.points.filter((_, i) => i !== bestIdx);
        const next = { ...prev, [selectedMask]: { ...cur, points: pts } };
        try { localStorage.setItem('map-masks', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const onSvgClick = (e: React.MouseEvent) => {
    if (!editMasksMode || !selectedMask) return;
    if (maskEditAction === 'add') {
      if (multiAddMode) {
        // accumulate preview points
        const coords = clientToPct(e.clientX, e.clientY);
        if (!coords) return;
        setTempAddPoints(list => [...list, { xPct: coords.xPct, yPct: coords.yPct }]);
      } else {
        addVertexAtClient(e.clientX, e.clientY);
      }
    } else if (maskEditAction === 'delete') {
      deleteNearestVertexAtClient(e.clientX, e.clientY);
    }
  };

  const commitMultiAdd = () => {
    if (!selectedMask || tempAddPoints.length === 0) return;
    // insert each temp point into mask at nearest segment, updating mask sequentially
    setMasks(prev => {
      const cur = prev[selectedMask]; if (!cur) return prev;
      let pts = [...cur.points];
      for (const tp of tempAddPoints) {
        // compute point in svg px for distance
        const tpSvg = { x: (tp.xPct / 100) * 1000, y: (tp.yPct / 100) * 600 };
        let bestIdx = 0; let bestDist = Infinity;
        for (let i = 0; i < pts.length; i++) {
          const j = (i + 1) % pts.length;
          const p1 = pctToSvg(pts[i]); const p2 = pctToSvg(pts[j]);
          const d = distPointToSegment(tpSvg.x, tpSvg.y, p1.x, p1.y, p2.x, p2.y);
          if (d < bestDist) { bestDist = d; bestIdx = j; }
        }
        // insert at bestIdx
        pts = [...pts.slice(0, bestIdx), { xPct: tp.xPct, yPct: tp.yPct }, ...pts.slice(bestIdx)];
      }
      const next = { ...prev, [selectedMask]: { ...cur, points: pts } };
      try { localStorage.setItem('map-masks', JSON.stringify(next)); } catch {}
      return next;
    });
    setTempAddPoints([]);
    setMultiAddMode(false);
  };

  const cancelMultiAdd = () => { setTempAddPoints([]); setMultiAddMode(false); };

  // backup / export helpers
  const [saving, setSaving] = useState(false);

  const downloadMasksBackup = () => {
    try {
      const payload = { masks: Object.values(masks), exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = `map-masks-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download backup failed', err); window.alert('Falha ao gerar backup local.');
    }
  };

  const saveMapsToServer = async () => {
    try {
      setSaving(true);
      const payload = { svg: null, markers: [], masks: Object.values(masks), name: `masks-backup-${new Date().toISOString()}` };
      const res = await fetch('/api/maps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `status ${res.status}`);
      }
      const body = await res.json();
      const returnedUrl = body?.url || (body?.id ? `/uploads/maps/${body.id}.json` : null);
      const absoluteUrl = returnedUrl && returnedUrl.startsWith('/') ? window.location.origin + returnedUrl : returnedUrl;
      // attempt automatic download of the saved JSON
      try {
        if (absoluteUrl) {
          const r = await fetch(absoluteUrl);
          if (r.ok) {
            const blob = await r.blob();
            const dlUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const fname = (body?.id ? `${body.id}` : `maps-backup`) + '.json';
            a.href = dlUrl; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(dlUrl);
            window.alert(`Mapa salvo no servidor e baixado localmente: ${returnedUrl}`);
          } else {
            window.alert(`Mapa salvo no servidor: ${returnedUrl} (falha ao baixar automaticamente)`);
          }
        } else {
          window.alert('Mapa salvo no servidor (sem URL retornada)');
        }
      } catch (err) {
        console.error('Auto-download failed', err);
        window.alert(`Mapa salvo no servidor: ${returnedUrl} (falha ao baixar automaticamente)`);
      }
    } catch (err) {
      console.error('Save map failed', err);
      window.alert('Falha ao salvar no servidor. Veja o console para detalhes.');
    } finally { setSaving(false); }
  };

  const moveOverlay = () => { /* removed */ };
  const endDragOverlay = () => { /* removed */ };

  // initialize masks from SVG bboxes if none exist
  useEffect(() => {
    if (Object.keys(masks).length > 0) return;
    const svg = document.querySelector('.interactive-svg-wrapper svg') as SVGSVGElement | null;
    if (!svg) return;
    const conts = svg.querySelectorAll('[data-name]');
    const next: Record<string, Mask> = {};
    conts.forEach((el) => {
      try {
        const name = (el as Element).getAttribute('data-name') || 'region';
        const id = name.toLowerCase();
        // get bbox and create a simple 4-point inset polygon
        const g = el as SVGGraphicsElement;
        if (typeof g.getBBox === 'function') {
          const b = g.getBBox();
          const padX = Math.max(8, b.width * 0.08);
          const padY = Math.max(8, b.height * 0.08);
          const x1 = b.x + padX;
          const x2 = b.x + b.width - padX;
          const y1 = b.y + padY;
          const y2 = b.y + b.height - padY;
          const points: Point[] = [
            { xPct: (x1 / 1000) * 100, yPct: (y1 / 600) * 100 },
            { xPct: (x2 / 1000) * 100, yPct: (y1 / 600) * 100 },
            { xPct: (x2 / 1000) * 100, yPct: (y2 / 600) * 100 },
            { xPct: (x1 / 1000) * 100, yPct: (y2 / 600) * 100 },
          ];
          next[id] = { id, name, points };
        }
      } catch (err) {}
    });
    if (Object.keys(next).length > 0) {
      setMasks(next);
      try { localStorage.setItem('map-masks', JSON.stringify(next)); } catch {}
    }
  }, [masks]);

  return (
    <div className="interactive-svg-wrapper relative w-full">
      {/* keep a fixed aspect ratio matching the SVG (1000x600 -> 60%) */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '60%' }}>
        {/* background map image */}
        <img src="/uploads/FinalMap.png" alt="Mapa" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

  {/* SVG overlay (semi-transparent) */}
  <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa" onClick={onSvgClick} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.45"/></filter>
        </defs>

  {/* handcrafted continent shapes removed per user request; only generated mask rectangles remain */}

        {/* render masks (editable) */}
        {Object.values(masks).map(mask => {
          const isActive = active === mask.name;
          return (
            <g key={mask.id}>
              <polygon
                points={mask.points.map(p => `${(p.xPct/100)*1000},${(p.yPct/100)*600}`).join(' ')}
                fill={isActive ? `${themeColorForName(mask.name)}22` : 'transparent'}
                stroke={isActive ? themeColorForName(mask.name) : 'transparent'}
                strokeWidth={isActive ? 2 : 0}
                style={{ transition: 'all 160ms ease', filter: isActive ? `drop-shadow(0 6px 18px ${themeColorForName(mask.name)}22)` : undefined, pointerEvents: 'auto', cursor: 'pointer' }}
                onMouseEnter={onEnter(mask.name)}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
              />

              {mask.points.length > 0 && (
                <>
                  {/* single golden label with hover glow */}
                  <text
                    x={centroidOf(mask.points).x}
                    y={centroidOf(mask.points).y}
                    fill={isActive ? '#fff9e0' : '#ffdf6b'}
                    fontSize={20}
                    fontWeight={800}
                    textAnchor="middle"
                    style={{ pointerEvents: 'auto', fontFamily: 'var(--font-map)', letterSpacing: '0.08em', userSelect: 'none', textTransform: 'uppercase', transition: 'fill 180ms ease, filter 180ms ease', fontVariant: 'all-small-caps', filter: isActive ? `drop-shadow(0 12px 32px rgba(255,200,80,0.98)) drop-shadow(0 0 22px rgba(255,230,140,0.72))` : 'none', stroke: '#000000', strokeWidth: 0.6, strokeOpacity: 0.95, paintOrder: 'stroke' }}
                    onMouseEnter={onEnter(mask.name)}
                    onMouseMove={onMove}
                    onMouseLeave={onLeave}
                  >
                    {mask.name.toUpperCase()}
                  </text>
                </>
              )}
            {editMasksMode && selectedMask === mask.id && mask.points.map((p, idx) => (
              <circle
                key={idx}
                cx={(p.xPct/100)*1000}
                cy={(p.yPct/100)*600}
                r={8}
                fill={selectedVertex && selectedVertex.maskId === mask.id && selectedVertex.idx === idx ? '#ffd' : '#fff'}
                stroke="#000"
                strokeWidth={1}
                style={{ cursor: maskEditAction === 'move' ? 'grab' : 'pointer' }}
                onPointerDown={(e) => { if (maskEditAction === 'move') startDragVertex(e, mask.id, idx); }}
                onPointerMove={moveVertex}
                onPointerUp={endDragVertex}
                onPointerCancel={endDragVertex}
              />
            ))}
            {/* preview temporary points when adding multiple */}
            {multiAddMode && selectedMask === mask.id && tempAddPoints.length > 0 && (
              <g>
                <polyline points={tempAddPoints.map(p => `${(p.xPct/100)*1000},${(p.yPct/100)*600}`).join(' ')} fill="none" stroke="#ffcc33" strokeWidth={2} strokeDasharray="6 4" style={{ pointerEvents: 'none' }} />
                {tempAddPoints.map((p, i) => (
                  <circle key={`t-${i}`} cx={(p.xPct/100)*1000} cy={(p.yPct/100)*600} r={6} fill="#ffcc33" opacity={0.95} style={{ pointerEvents: 'none' }} />
                ))}
              </g>
            )}
            </g>
          );
        })}

        {/* transparent rect captures clicks only when adding points; otherwise it must not block vertex handles */}
        <rect
          x={0}
          y={0}
          width={1000}
          height={600}
          fill="transparent"
          style={{ pointerEvents: (editMasksMode && selectedMask && maskEditAction === 'add') ? 'all' : 'none' }}
          onClick={onSvgClick}
        />
        </svg>
    </div>

      {/* small controls */}
      <div style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 200, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn ml-2" onClick={() => { setEditMasksMode(m => !m); setSelectedMask(null); }}>{editMasksMode ? 'Fechar máscaras' : 'Editar máscaras'}</button>
        {editMasksMode && Object.values(masks).length > 0 && (
          <>
            <select className="btn ml-2" value={selectedMask ?? ''} onChange={(e) => setSelectedMask(e.target.value)} style={{ padding: '6px 8px' }}>
              <option value="">Selecione máscara</option>
              {Object.values(masks).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {selectedMask && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 6 }}>
                <label style={{ fontSize: 12 }}><input type="radio" name="maskAction" checked={maskEditAction === 'move'} onChange={() => setMaskEditAction('move')} /> Mover</label>
                <label style={{ fontSize: 12 }}><input type="radio" name="maskAction" checked={maskEditAction === 'add'} onChange={() => setMaskEditAction('add')} /> Adicionar ponto</label>
                <label style={{ fontSize: 12 }}><input type="radio" name="maskAction" checked={maskEditAction === 'delete'} onChange={() => setMaskEditAction('delete')} /> Remover ponto</label>
              </div>
            )}
          </>
        )}
        {editMasksMode && (
          <>
            <button className="btn ml-2" onClick={() => { try { localStorage.setItem('map-masks', JSON.stringify(masks)); } catch {} }}>Salvar máscaras</button>
            <button className="btn ml-2" onClick={() => { localStorage.removeItem('map-masks'); setMasks({}); }}>Reset máscaras</button>
            <button className="btn ml-2" onClick={downloadMasksBackup}>Baixar backup (JSON)</button>
            <button className="btn ml-2" onClick={saveMapsToServer} disabled={saving}>{saving ? 'Salvando...' : 'Salvar no servidor'}</button>
            {selectedMask && maskEditAction === 'add' && (
              <>
                {!multiAddMode ? (
                  <button className="btn ml-2" onClick={() => { setMultiAddMode(true); setTempAddPoints([]); }}>Iniciar múltiplos pontos</button>
                ) : (
                  <>
                    <button className="btn ml-2" onClick={commitMultiAdd}>Concluir pontos</button>
                    <button className="btn ml-2" onClick={cancelMultiAdd}>Cancelar pontos</button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Tooltip */}
      <div className="map-tooltip pointer-events-none" style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, opacity: tooltip.visible ? 1 : 0, zIndex: 120 }}>{tooltip.text}</div>
    </div>
  );
}
