import React, { useEffect, useRef, useState } from 'react';

type Marker = { id: string; name: string; xPct: number; yPct: number };
type Mask = { id: string; name: string; points: { xPct: number; yPct: number }[] };

function uid(prefix = '') { return prefix + Math.random().toString(36).slice(2,9); }

export default function MapEditor({
  initialSvg, // optional initial svg markup
  onClose,
  inline = false,
}: { initialSvg?: string | null; onClose: () => void; inline?: boolean }) {
  const [svgText, setSvgText] = useState<string | null>(initialSvg || null);
  const [pasteText, setPasteText] = useState('');
  const [markers, setMarkers] = useState<Marker[]>(() => {
    try { const raw = localStorage.getItem('map-editor-markers'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [masks, setMasks] = useState<Mask[]>(() => {
    try { const raw = localStorage.getItem('map-editor-masks'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<string[]>([]);
  const [drawMode, setDrawMode] = useState(false);
  const drawingRef = useRef<{ points: { x: number; y: number }[]; pointerId: number | null } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => { localStorage.setItem('map-editor-markers', JSON.stringify(markers)); }, [markers]);
  useEffect(() => { localStorage.setItem('map-editor-masks', JSON.stringify(masks)); }, [masks]);

  const onFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSvgText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const handleSvgPaste = (text: string) => setSvgText(text);

  const getContainerRect = () => containerRef.current?.getBoundingClientRect();

  const addMarkerAt = (clientX: number, clientY: number) => {
    const rect = getContainerRect();
    if (!rect) return;
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    setMarkers((s) => [...s, { id: uid('m_'), name: 'Novo Ponto', xPct: Math.max(0, Math.min(100, xPct)), yPct: Math.max(0, Math.min(100, yPct)) }]);
  };

  const onClickSvg = (e: React.MouseEvent) => {
    // if click on a marker element, ignore here
    if ((e.target as HTMLElement).closest('.editor-marker')) return;
    addMarkerAt(e.clientX, e.clientY);
  };

  const toggleSelectMarker = (id: string) => {
    setSelectedMarkerIds((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const clearSelection = () => setSelectedMarkerIds([]);

  const startDrag = (e: React.PointerEvent, id: string) => {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();
    draggingRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  const startDrawing = (e: React.PointerEvent) => {
    // begin freehand drawing when drawMode is enabled
    if (!drawMode) return;
    const rect = getContainerRect();
    if (!rect) return;
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = { points: [p], pointerId: e.pointerId };
    e.preventDefault();
  };

  const drawingMove = (e: React.PointerEvent) => {
    if (!drawMode || !drawingRef.current) return;
    const rect = getContainerRect();
    if (!rect) return;
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawingRef.current.points.push(p);
    // trigger re-render by updating a dummy state? We'll rely on pointerup to finalize.
  };

  const endDrawing = (e: React.PointerEvent) => {
    if (!drawMode || !drawingRef.current) return;
    const rect = getContainerRect();
    if (!rect) { drawingRef.current = null; return; }
    const pts = drawingRef.current.points.map(pt => ({ xPct: Math.max(0, Math.min(100, (pt.x / rect.width) * 100)), yPct: Math.max(0, Math.min(100, (pt.y / rect.height) * 100)) }));
    const newMask: Mask = { id: uid('mask_'), name: 'Nova Máscara', points: pts };
    setMasks(s => [...s, newMask]);
    drawingRef.current = null;
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { id } = draggingRef.current;
    const rect = getContainerRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setMarkers((list) => list.map(m => m.id === id ? { ...m, xPct: Math.max(0, Math.min(100, xPct)), yPct: Math.max(0, Math.min(100, yPct)) } : m));
  };

  const endDrag = (e?: React.PointerEvent) => {
    if (draggingRef.current && e) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
    }
    draggingRef.current = null;
  };

  const updateMarker = (id: string, patch: Partial<Marker>) => setMarkers((s) => s.map(m => m.id === id ? { ...m, ...patch } : m));
  const removeMarker = (id: string) => setMarkers((s) => s.filter(m => m.id !== id));

  const download = () => {
  const payload = { svg: svgText, markers, masks };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'map-markers.json'; a.click(); URL.revokeObjectURL(url);
  };

  const generateMaskFromSelected = () => {
    if (!selectedMarkerIds.length) return alert('Selecione alguns marcadores primeiro');
    const pts = selectedMarkerIds.map(id => markers.find(m => m.id === id)).filter(Boolean) as Marker[];
    // compute convex hull to create a simple polygon around points
    const points = pts.map(p => [p.xPct, p.yPct]);
    const hull = convexHull(points);
    const maskPts = hull.map(([x, y]) => ({ xPct: x, yPct: y }));
    const newMask: Mask = { id: uid('mask_'), name: 'Mask from markers', points: maskPts };
    setMasks(s => [...s, newMask]);
    clearSelection();
  };

  // convex hull - monotone chain (returns array of [x,y])
  function convexHull(points: number[][]) {
    if (points.length <= 1) return points.slice();
    const pts = points.slice().map(p => ({ x: p[0], y: p[1] }));
    pts.sort((a,b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower: any[] = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper: any[] = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
      upper.push(p);
    }
    upper.pop(); lower.pop();
    const hull = lower.concat(upper).map((p:any) => [p.x, p.y]);
    return hull;
  }

  const saveToServer = async () => {
    try {
      const payload = { svg: svgText, markers, masks, name: 'Mapa personalizado' };
      const res = await fetch('/api/maps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) return alert('Falha ao salvar no servidor');
      const data = await res.json();
      const url = data?.url ? data.url : `/uploads/maps/${data.id}.json`;
      prompt('Mapa salvo em:', url);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar');
    }
  };

  const saveLocal = () => {
    try {
      const payload = { svg: svgText, markers, masks, savedAt: new Date().toISOString() };
      localStorage.setItem('map-editor-package', JSON.stringify(payload));
      alert('Mapa salvo localmente (localStorage)');
    } catch (err) { console.error(err); alert('Falha ao salvar localmente'); }
  };

  const applyPastedSvg = () => {
    if (!pasteText || !pasteText.trim()) return alert('Cole o conteúdo SVG primeiro');
    setSvgText(pasteText);
    setPasteText('');
  };

  const importJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.markers) setMarkers(parsed.markers);
  if (parsed?.svg) setSvgText(parsed.svg);
  if (parsed?.masks) setMasks(parsed.masks);
    } catch (err) { alert('JSON inválido'); }
  };

  const inner = (
    <div className="map-editor">
      <div className="map-editor-sidebar">
        <h3>Map Editor</h3>
        <label className="block">Carregar SVG
          <input type="file" accept="image/svg+xml" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">Colar SVG (texto)
          <textarea className="w-full" rows={6} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Cole o conteúdo SVG aqui" />
          <div className="mt-2"><button className="btn" onClick={applyPastedSvg}>Aplicar SVG</button></div>
        </label>
        <div>
          <button className="btn" onClick={saveLocal}>Salvar local</button>
          <button className="btn" onClick={saveToServer}>Salvar no servidor</button>
          <button className="btn" onClick={download}>Exportar JSON</button>
          <button className="btn" onClick={() => { const raw = prompt('Cole JSON import:'); if (raw) importJson(raw); }}>Importar JSON</button>
        </div>
        <hr />
        <div>
          <h4>Pontos ({markers.length})</h4>
          <div className="map-editor-list">
            <div className="mb-2 flex gap-2">
              <button className="btn" onClick={() => setDrawMode(d => !d)}>{drawMode ? 'Desativar Desenho' : 'Ativar Desenho'}</button>
              <button className="btn" onClick={generateMaskFromSelected}>Gerar máscara (hull) dos marcadores selecionados</button>
              <button className="btn" onClick={() => { setMarkers([]); setMasks([]); clearSelection(); }}>Limpar tudo</button>
            </div>
            {markers.map(m => (
              <div key={m.id} className={"map-editor-row p-1 flex items-center justify-between " + (selectedMarkerIds.includes(m.id) ? 'bg-indigo-50' : '')}>
                <input value={m.name} onChange={(e) => updateMarker(m.id, { name: e.target.value })} className="flex-1 mr-2" />
                <div className="map-editor-controls flex gap-1">
                  <button className="btn btn-xs" onClick={() => toggleSelectMarker(m.id)}>{selectedMarkerIds.includes(m.id) ? 'Selecionado' : 'Selecionar'}</button>
                  <button className="btn btn-xs" onClick={() => removeMarker(m.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <button className="btn btn-ghost" onClick={onClose}>Fechar Editor</button>
        </div>
      </div>

      <div className="map-editor-canvas">
        <div className="map-editor-canvas-inner" ref={containerRef} onClick={onClickSvg} onPointerDown={startDrawing as any} onPointerMove={(e) => { drawingMove(e); onPointerMove(e as any); }} onPointerUp={(e) => { endDrawing(e as any); endDrag(e as any); }} onPointerLeave={(e) => { endDrawing(e as any); endDrag(e as any); }}>
            {svgText ? (
              <div className="map-editor-svg" dangerouslySetInnerHTML={{ __html: svgText }} style={{ pointerEvents: 'none' }} />
            ) : (
              <div className="map-editor-placeholder">Nenhum SVG carregado — arraste ou cole o SVG</div>
            )}

            {/* masks overlay as SVG */}
            <svg className="map-editor-masks" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {masks.map(mask => {
                const rect = containerRef.current?.getBoundingClientRect();
                const d = (mask.points || []).map((pt, i) => {
                  const x = rect ? (pt.xPct / 100) * rect.width : pt.xPct;
                  const y = rect ? (pt.yPct / 100) * rect.height : pt.yPct;
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                }).join(' ') + (mask.points.length ? ' Z' : '');
                return (
                  <path key={mask.id} d={d} fill="rgba(255,200,50,0.18)" stroke="rgba(255,200,50,0.9)" strokeWidth={2} />
                );
              })}
            </svg>

          {/* markers overlay */}
          {markers.map(m => (
            <div
              key={m.id}
              className={"editor-marker " + (selectedMarkerIds.includes(m.id) ? 'selected' : '')}
              style={{ position: 'absolute', left: `${m.xPct}%`, top: `${m.yPct}%`, transform: 'translate(-50%,-50%)' }}
              onPointerDown={(e) => startDrag(e, m.id)}
              onPointerUp={endDrag as any}
              title={m.name}
            >
              <div className="marker-dot" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="map-editor-inline-container" style={{ position: 'absolute', top: 16, right: 16, width: 760, height: 460, zIndex: 60 }}>
        {inner}
      </div>
    );
  }

  return (
    <div className="map-editor-modal">
      {inner}
    </div>
  );
}
