/*
Mapa interativo final - versão limpa sem edição
*/

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { Location } from "@shared/schema";

interface WorldMapProps {
  locations: Location[];
}

// Fictional world regions with final coordinates
const regions = {
  umbra: { 
    name: "Umbra", 
    center: { x: 23, y: 25 }, 
    bounds: { x: 1, y: 0, width: 45, height: 41 },
    zoom: 2.8,
    color: "#1f2937",
    desc: "The dark, shadowed northern reaches",
    clipPath: "polygon(23.2% 0.5%, 43.4% 16.6%, 45.6% 27.8%, 37.2% 39.8%, 14.7% 40.4%, 3.6% 40.3%, 1.6% 22.4%, 10.1% 16.1%)"
  },
  silvanum: { 
    name: "Silvanum", 
    center: { x: 30, y: 54 }, 
    bounds: { x: 15, y: 29, width: 30, height: 50 },
    zoom: 3.2,
    color: "#065f46",
    desc: "Dense forests in the central band",
    clipPath: "polygon(16.4% 38.9%, 37.0% 29.9%, 44.2% 59.0%, 38.9% 67.6%, 33.2% 78.4%, 24.6% 71.8%, 15.6% 50.2%)"
  },
  luminah: { 
    name: "Luminah", 
    center: { x: 44, y: 83 }, 
    bounds: { x: 30, y: 65, width: 29, height: 35 },
    zoom: 3.0,
    color: "#dc2626",
    desc: "The rosier southern lands",
    clipPath: "polygon(51.0% 65.9%, 56.3% 73.8%, 58.6% 89.2%, 30.0% 100.0%, 34.4% 95.4%, 36.1% 88.6%, 35.7% 78.9%, 35.1% 75.6%, 42.4% 71.3%)"
  },
  akeli: { 
    name: "Akeli", 
    center: { x: 80, y: 65 }, 
    bounds: { x: 70, y: 55, width: 20, height: 20 },
    zoom: 2.5,
    color: "#7c3aed",
    desc: "Eastern crystal formations",
    clipPath: "polygon(75% 55%, 85% 58%, 88% 65%, 85% 72%, 75% 75%, 70% 65%)"
  },
  aquarium: { 
    name: "Aquarium", 
    center: { x: 75, y: 45 }, 
    bounds: { x: 65, y: 35, width: 20, height: 20 },
    zoom: 4.0,
    color: "#059669",
    desc: "Mystic water realm",
    clipPath: "polygon(70% 40%, 80% 38%, 85% 45%, 80% 52%, 70% 50%)"
  },
  ferros: { 
    name: "Ferros", 
    center: { x: 80, y: 25 }, 
    bounds: { x: 70, y: 15, width: 20, height: 20 },
    zoom: 4.0,
    color: "#b45309",
    desc: "Iron-rich territories",
    clipPath: "polygon(75% 18%, 85% 20%, 88% 25%, 85% 30%, 75% 32%, 70% 25%)"
  }
};

export default function WorldMapInteractive({ locations }: WorldMapProps) {
  // Basic states
  const [hoveredContinent, setHoveredContinent] = useState<string | null>(null);
  
  // Map reference
  const mapRef = useRef<HTMLDivElement>(null);

  // Handle region click
  const handleRegionClick = (regionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredContinent(regionKey);
  };

  // Simple region detection based on bounds
  const isPointInRegion = (x: number, y: number, regionKey: string) => {
    const region = regions[regionKey as keyof typeof regions];
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
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    console.log('Map clicked at:', { x, y });
    
    // Find which region was clicked
    for (const [regionKey, region] of Object.entries(regions)) {
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
        {hoveredContinent ? `Viewing ${regions[hoveredContinent as keyof typeof regions].name} region` : "Viewing global map"}
      </div>

      <div 
        ref={mapRef}
        className="relative h-[70vh] md:h-[80vh] w-full select-none bg-slate-50 dark:bg-slate-900 overflow-hidden border-2 border-gray-300 dark:border-gray-600 rounded-lg"
        onClick={handleMapClick}
        style={{ cursor: 'default' }}
      >
        {/* Map Image */}
        <motion.img
          src="/FinalMap.png"
          alt="Fantasy World Map"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Regions */}
        {Object.entries(regions).map(([regionKey, region]) => (
          <div key={regionKey}>
            {/* Region Clickable Area */}
            <motion.div
              className="absolute cursor-pointer"
              style={{
                left: `${region.bounds.x}%`,
                top: `${region.bounds.y}%`,
                width: `${region.bounds.width}%`,
                height: `${region.bounds.height}%`,
              }}
              onClick={(e) => handleRegionClick(regionKey, e)}
              onMouseEnter={() => setHoveredContinent(regionKey)}
              onMouseLeave={() => setHoveredContinent(null)}
              onFocus={() => setHoveredContinent(regionKey)}
              onBlur={() => setHoveredContinent(null)}
            />

            {/* Region Visual Overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: region.clipPath,
                backgroundColor: `${region.color}20`,
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
                scale: hoveredContinent === regionKey ? 1.1 : 1,
                opacity: hoveredContinent === regionKey ? 1 : 0.8,
              }}
            >
              <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg border-2 ${
                hoveredContinent === regionKey
                  ? 'bg-yellow-400 text-black border-yellow-600' 
                  : 'bg-black bg-opacity-80 text-white border-gray-600'
              }`}>
                {region.name}
              </div>
            </motion.div>
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
                  backgroundColor: regions[hoveredContinent as keyof typeof regions].color,
                  boxShadow: `0 0 8px ${regions[hoveredContinent as keyof typeof regions].color}60`
                }}
              />
              <div>
                <h3 className="font-bold text-lg">
                  {regions[hoveredContinent as keyof typeof regions].name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {regions[hoveredContinent as keyof typeof regions].desc}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              Hover over a region to learn more
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
