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

// Fictional world regions with final coordinates
const regions = {
  umbra: { 
    name: "Umbra", 
    center: { x: 23, y: 25 }, 
    bounds: { x: 1, y: 0, width: 45, height: 41 },
    zoom: 2.8,
    color: "#1f2937",
    desc: "The dark, shadowed northern reaches",
    clipPath: "polygon(23.194662480376767% 0.52687906478966%, 43.4458398744113% 16.596690540874288%, 45.6436420722135% 27.79287066765456%, 37.244897959183675% 39.779369391619326%, 14.717425431711145% 40.43796822260641%, 3.571428571428571% 40.30624845640899%, 1.6091051805337522% 22.39236025356055%, 10.08634222919937% 16.06981147608463%)"
  },
  silvanum: { 
    name: "Silvanum", 
    center: { x: 30, y: 54 }, 
    bounds: { x: 15, y: 29, width: 30, height: 50 },
    zoom: 3.2,
    color: "#065f46",
    desc: "Dense forests in the central band",
    clipPath: "polygon(16.444270015698585% 38.857331028237425%, 37.009419152276294% 29.900386926813205%, 44.230769230769226% 59.010455256441915%, 38.893249607535324% 67.5722400592739%, 33.16326530612245% 78.37326088746192%, 24.607535321821036% 71.78727257759118%, 15.580847723704865% 50.185230921215116%)"
  },
  luminah: { 
    name: "Luminah", 
    center: { x: 44, y: 83 }, 
    bounds: { x: 30, y: 65, width: 29, height: 35 },
    zoom: 3.0,
    color: "#dc2626",
    desc: "The rosier southern lands",
    clipPath: "polygon(50.981161695447405% 65.8598830987075%, 56.31868131868132% 73.7630690705524%, 58.594976452119305% 89.17428171564995%, 30% 100%, 34.41915227629514% 95.36511072692846%, 36.14599686028257% 88.6474026508603%, 35.67503924646782% 78.90013995225158%, 35.12558869701727% 75.6071457973162%, 42.425431711146% 71.26039351280151%)"
  },
  akeli: { 
    name: "Akeli", 
    center: { x: 80, y: 34 }, 
    bounds: { x: 60, y: 11, width: 40, height: 46 },
    zoom: 2.5,
    color: "#7c3aed",
    desc: "Eastern crystal formations",
    clipPath: "polygon(76.88383045525903% 11.591339425372519%, 99.33281004709576% 23.7095579155347%, 94.78021978021978% 47.94599489585906%, 63.775510204081634% 55.98090063390138%, 60.40031397174255% 30.954145056392523%, 66.52276295133439% 26.080513707088173%)"
  },
  aquarium: { 
    name: "Aquarium", 
    center: { x: 55, y: 52 }, 
    bounds: { x: 50, y: 47, width: 10, height: 10 },
    zoom: 4.0,
    color: "#059669",
    desc: "Mystic water realm",
    clipPath: "circle(3% at 55.06279434850864% 52.42446694657117%)"
  },
  ferros: { 
    name: "Ferros", 
    center: { x: 55, y: 52 }, 
    bounds: { x: 50, y: 47, width: 10, height: 10 },
    zoom: 4.0,
    color: "#b45309",
    desc: "Iron-rich territories",
    clipPath: "circle(3% at 55.06279434850864% 52.42446694657117%)"
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

  // Point-in-polygon test for circular regions
  const isPointInRegion = (x: number, y: number, regionKey: string) => {
    const region = regions[regionKey as keyof typeof regions];
    if (region.clipPath.startsWith('circle(')) {
      const match = region.clipPath.match(/circle\((\d+)% at ([\d.]+)% ([\d.]+)%\)/);
      if (match) {
        const radius = parseFloat(match[1]);
        const centerX = parseFloat(match[2]);
        const centerY = parseFloat(match[3]);
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
      }
    }
    return false;
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
