/*
Mapa interativo sem sistema de edição
*/

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { Location } from "@shared/schema";

interface WorldMapProps {
  locations: Location[];
}

// Fictional world regions with editable points for polygon shapes
const regions = {
  umbra: { 
    name: "Umbra", 
    center: { x: 23, y: 25 }, 
    bounds: { x: 1, y: 0, width: 45, height: 41 },
    zoom: 2.8,
    color: "#1f2937",
    desc: "The dark, shadowed northern reaches",
    points: [
      { x: 23.2, y: 0.5 },
      { x: 43.4, y: 16.6 },
      { x: 45.6, y: 27.8 },
      { x: 37.2, y: 39.8 },
      { x: 14.7, y: 40.4 },
      { x: 3.6, y: 40.3 },
      { x: 1.6, y: 22.4 },
      { x: 10.1, y: 16.1 }
    ]
  },
  silvanum: { 
    name: "Silvanum", 
    center: { x: 30, y: 54 }, 
    bounds: { x: 15, y: 29, width: 30, height: 50 },
    zoom: 3.2,
    color: "#065f46",
    desc: "Dense forests in the central band",
    points: [
      { x: 16.4, y: 38.9 },
      { x: 37.0, y: 29.9 },
      { x: 44.2, y: 59.0 },
      { x: 38.9, y: 67.6 },
      { x: 33.2, y: 78.4 },
      { x: 24.6, y: 71.8 },
      { x: 15.6, y: 50.2 }
    ]
  },
  luminah: { 
    name: "Luminah", 
    center: { x: 44, y: 83 }, 
    bounds: { x: 30, y: 65, width: 29, height: 35 },
    zoom: 3.0,
    color: "#dc2626",
    desc: "The rosier southern lands",
    points: [
      { x: 51.0, y: 65.9 },
      { x: 56.3, y: 73.8 },
      { x: 58.6, y: 89.2 },
      { x: 30.0, y: 100.0 },
      { x: 34.4, y: 95.4 },
      { x: 36.1, y: 88.6 },
      { x: 35.7, y: 78.9 },
      { x: 35.1, y: 75.6 },
      { x: 42.4, y: 71.3 }
    ]
  },
  akeli: { 
    name: "Akeli", 
    center: { x: 80, y: 65 }, 
    bounds: { x: 70, y: 55, width: 20, height: 20 },
    zoom: 2.5,
    color: "#7c3aed",
    desc: "Eastern crystal formations",
    points: [
      { x: 75, y: 55 },
      { x: 85, y: 58 },
      { x: 88, y: 65 },
      { x: 85, y: 72 },
      { x: 75, y: 75 },
      { x: 70, y: 65 }
    ]
  },
  aquarium: { 
    name: "Aquarium", 
    center: { x: 75, y: 45 }, 
    bounds: { x: 65, y: 35, width: 20, height: 20 },
    zoom: 4.0,
    color: "#059669",
    desc: "Mystic water realm",
    points: [
      { x: 70, y: 40 },
      { x: 80, y: 38 },
      { x: 85, y: 45 },
      { x: 80, y: 52 },
      { x: 70, y: 50 }
    ]
  },
  ferros: { 
    name: "Ferros", 
    center: { x: 80, y: 25 }, 
    bounds: { x: 70, y: 15, width: 20, height: 20 },
    zoom: 4.0,
    color: "#b45309",
    desc: "Iron-rich territories",
    points: [
      { x: 75, y: 18 },
      { x: 85, y: 20 },
      { x: 88, y: 25 },
      { x: 85, y: 30 },
      { x: 75, y: 32 },
      { x: 70, y: 25 }
    ]
  }
};

export default function WorldMapInteractive({ locations }: WorldMapProps) {
  // Basic states
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableRegions, setEditableRegions] = useState(regions);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{region: string, pointIndex: number} | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Map reference
  const mapRef = useRef<HTMLDivElement>(null);

  // Convert points array to clipPath polygon
  const pointsToClipPath = (points: {x: number, y: number}[]) => {
    const pathString = points.map(p => `${p.x}% ${p.y}%`).join(', ');
    return `polygon(${pathString})`;
  };

  // Handle region click
  const handleRegionClick = (regionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode) {
      setHoveredContinent(regionKey);
    } else {
      setSelectedRegion(selectedRegion === regionKey ? null : regionKey);
    }
  };

  // Convert screen coordinates to percentage
  const getPercentageCoords = (event: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Handle drag start
  const handleDragStart = (regionKey: string, pointIndex: number, event: React.MouseEvent) => {
    if (!isEditMode) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    setDragTarget({ region: regionKey, pointIndex });
  };

  // Handle drag move
  const handleDragMove = (event: React.MouseEvent) => {
    if (!isDragging || !dragTarget || !mapRef.current) return;
    
    const coords = getPercentageCoords(event, mapRef.current);
    
    setEditableRegions(prev => ({
      ...prev,
      [dragTarget.region]: {
        ...prev[dragTarget.region as keyof typeof prev],
        points: prev[dragTarget.region as keyof typeof prev].points.map((point, index) => 
          index === dragTarget.pointIndex ? coords : point
        )
      }
    }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  // Add new point to selected region
  const addPoint = (regionKey: string, event: React.MouseEvent) => {
    if (!isEditMode || !mapRef.current) return;
    
    const coords = getPercentageCoords(event, mapRef.current);
    
    setEditableRegions(prev => ({
      ...prev,
      [regionKey]: {
        ...prev[regionKey as keyof typeof prev],
        points: [...prev[regionKey as keyof typeof prev].points, coords]
      }
    }));
  };

  // Remove point from region
  const removePoint = (regionKey: string, pointIndex: number) => {
    setEditableRegions(prev => ({
      ...prev,
      [regionKey]: {
        ...prev[regionKey as keyof typeof prev],
        points: prev[regionKey as keyof typeof prev].points.filter((_, index) => index !== pointIndex)
      }
    }));
  };

  // Save coordinates to console (you can implement localStorage or API call here)
  const saveCoordinates = () => {
    const formattedRegions = Object.entries(editableRegions).reduce((acc, [key, region]) => {
      acc[key] = {
        ...region,
        clipPath: pointsToClipPath(region.points)
      };
      return acc;
    }, {} as any);
    
    console.log('Saved coordinates:', JSON.stringify(formattedRegions, null, 2));
    
    // Also save to localStorage for persistence
    localStorage.setItem('worldMapCoordinates', JSON.stringify(formattedRegions));
    
    alert('Coordenadas salvas! Verifique o console para ver os dados. Também salvei no localStorage.');
  };

  // Load coordinates from localStorage
  const loadSavedCoordinates = () => {
    const saved = localStorage.getItem('worldMapCoordinates');
    if (saved) {
      try {
        const parsedRegions = JSON.parse(saved);
        // Convert clipPath back to points if needed
        const regionsWithPoints = Object.entries(parsedRegions).reduce((acc, [key, region]: [string, any]) => {
          acc[key] = {
            ...region,
            points: region.points || region.clipPath ? extractPointsFromClipPath(region.clipPath) : regions[key as keyof typeof regions].points
          };
          return acc;
        }, {} as any);
        
        setEditableRegions(regionsWithPoints);
        alert('Coordenadas carregadas do localStorage!');
      } catch (e) {
        alert('Erro ao carregar coordenadas salvas');
      }
    } else {
      alert('Nenhuma coordenada salva encontrada');
    }
  };

  // Extract points from clipPath (basic implementation)
  const extractPointsFromClipPath = (clipPath: string) => {
    if (clipPath.startsWith('polygon(')) {
      const coords = clipPath.match(/polygon\(([^)]+)\)/)?.[1];
      if (coords) {
        return coords.split(',').map(coord => {
          const [x, y] = coord.trim().split(' ');
          return {
            x: parseFloat(x.replace('%', '')),
            y: parseFloat(y.replace('%', ''))
          };
        });
      }
    }
    return [];
  };

  // Reset to original coordinates
  const resetCoordinates = () => {
    setEditableRegions(regions);
    setSelectedRegion(null);
  };

  // Simple region detection based on bounds
  const isPointInRegion = (x: number, y: number, regionKey: string) => {
    const region = editableRegions[regionKey as keyof typeof editableRegions];
    const bounds = region.bounds;
    
    return (
      x >= bounds.x && 
      x <= bounds.x + bounds.width &&
      y >= bounds.y && 
      y <= bounds.y + bounds.height
    );
  };

  // Handle clicks on the map to detect region
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    if (isEditMode && selectedRegion) {
      // Add point to selected region
      addPoint(selectedRegion, event);
      return;
    }
    
    if (isEditMode) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    console.log('Map clicked at:', { x, y });
    
    // Find which region was clicked
    for (const [regionKey, region] of Object.entries(editableRegions)) {
      if (isPointInRegion(x, y, regionKey)) {
        setHoveredContinent(regionKey);
        console.log(`Clicked on ${region.name}`);
        return;
      }
    }
    
    // If no region clicked, reset to global view
    setHoveredContinent(null);
  };

  return (
    <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
      <div className="sr-only" aria-live="polite">
        {hoveredContinent ? `Viewing ${editableRegions[hoveredContinent as keyof typeof editableRegions].name} region` : "Viewing global map"}
      </div>

      {/* Editor Controls */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              setSelectedRegion(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isEditMode ? 'Sair da Edição' : 'Modo Edição'}
          </button>
          
          {isEditMode && (
            <>
              <button
                onClick={saveCoordinates}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                Salvar Coordenadas
              </button>
              <button
                onClick={loadSavedCoordinates}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Carregar Salvas
              </button>
              <button
                onClick={resetCoordinates}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                Resetar
              </button>
            </>
          )}
        </div>
        
        {isEditMode && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedRegion 
              ? `Editando ${editableRegions[selectedRegion as keyof typeof editableRegions].name} - Clique no mapa para adicionar pontos`
              : "Clique em uma região para selecioná-la, depois arraste os pontos ou clique para adicionar novos"
            }
          </div>
        )}
      </div>

      <div 
        ref={mapRef}
        className="relative h-[70vh] md:h-[80vh] w-full select-none bg-slate-50 dark:bg-slate-900 overflow-hidden border-2 border-gray-300 dark:border-gray-600 rounded-lg"
        onClick={handleMapClick}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : (isEditMode ? 'grab' : 'default') }}
      >
        {/* Map Image */}
        <motion.img
          src="/FinalMap.png"
          alt="Fantasy World Map"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Regions */}
        {Object.entries(editableRegions).map(([regionKey, region]) => (
          <div key={regionKey}>
            {/* Region Clickable Area */}
            <motion.div
              className={`absolute ${isEditMode ? 'cursor-pointer' : 'cursor-pointer'}`}
              style={{
                left: `${region.bounds.x}%`,
                top: `${region.bounds.y}%`,
                width: `${region.bounds.width}%`,
                height: `${region.bounds.height}%`,
                zIndex: selectedRegion === regionKey ? 20 : 10
              }}
              onClick={(e) => handleRegionClick(regionKey, e)}
              onMouseEnter={() => !isDragging && setHoveredContinent(regionKey)}
              onMouseLeave={() => !isDragging && setHoveredContinent(null)}
              onFocus={() => setHoveredContinent(regionKey)}
              onBlur={() => setHoveredContinent(null)}
            />

            {/* Region Visual Overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: pointsToClipPath(region.points),
                backgroundColor: selectedRegion === regionKey 
                  ? `${region.color}60` 
                  : `${region.color}20`,
                border: selectedRegion === regionKey ? `2px solid ${region.color}` : 'none'
              }}
              whileHover={{
                backgroundColor: `${region.color}30`,
              }}
              animate={hoveredContinent === regionKey ? {
                backgroundColor: `${region.color}40`,
              } : {}}
            />

            {/* Region Name Label */}
            <motion.div
              className="absolute pointer-events-none z-30"
              style={{
                left: `${region.center.x}%`,
                top: `${region.center.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: hoveredContinent === regionKey || selectedRegion === regionKey ? 1.1 : 1,
                opacity: hoveredContinent === regionKey || selectedRegion === regionKey ? 1 : 0.8,
              }}
            >
              <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg border-2 ${
                selectedRegion === regionKey
                  ? 'bg-purple-400 text-white border-purple-600'
                  : hoveredContinent === regionKey
                  ? 'bg-yellow-400 text-black border-yellow-600' 
                  : 'bg-black bg-opacity-80 text-white border-gray-600'
              }`}>
                {region.name}
              </div>
            </motion.div>

            {/* Edit Mode: Draggable Points */}
            {isEditMode && region.points.map((point, pointIndex) => (
              <motion.div
                key={`${regionKey}-${pointIndex}`}
                className="absolute z-50 cursor-grab active:cursor-grabbing"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleDragStart(regionKey, pointIndex, e)}
                onDoubleClick={() => removePoint(regionKey, pointIndex)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: selectedRegion === regionKey ? 1.2 : 1,
                  opacity: selectedRegion === regionKey ? 1 : 0.7
                }}
              >
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    selectedRegion === regionKey ? 'ring-2 ring-purple-400' : ''
                  }`}
                  style={{ backgroundColor: region.color }}
                  title={`Ponto ${pointIndex + 1} - Duplo clique para remover`}
                />
              </motion.div>
            ))}

            {/* Point numbers for selected region */}
            {isEditMode && selectedRegion === regionKey && region.points.map((point, pointIndex) => (
              <div
                key={`label-${regionKey}-${pointIndex}`}
                className="absolute z-40 pointer-events-none text-xs font-bold text-white bg-black bg-opacity-70 rounded px-1"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y - 3}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {pointIndex + 1}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <CardContent className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {hoveredContinent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{
                  backgroundColor: editableRegions[hoveredContinent as keyof typeof editableRegions].color,
                  boxShadow: `0 0 8px ${editableRegions[hoveredContinent as keyof typeof editableRegions].color}60`
                }}
              />
              <div>
                <h3 className="font-bold text-lg">
                  {editableRegions[hoveredContinent as keyof typeof editableRegions].name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {editableRegions[hoveredContinent as keyof typeof editableRegions].desc}
                </p>
                {isEditMode && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Pontos: {editableRegions[hoveredContinent as keyof typeof editableRegions].points.length} | 
                    {selectedRegion === hoveredContinent ? ' SELECIONADA' : ' Clique para selecionar'}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              {isEditMode 
                ? selectedRegion 
                  ? "Clique no mapa para adicionar pontos, arraste para mover, duplo clique para remover" 
                  : "Clique em uma região para começar a editar"
                : "Hover over a region to learn more"
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
