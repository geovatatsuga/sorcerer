import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ParallaxLayer from "@/components/parallax-layer";
import type { Location } from "@shared/schema";

interface WorldMapProps {
  locations: Location[];
}

export default function WorldMap({ locations }: WorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const getLocationColor = (type: string) => {
    switch (type) {
      case "capital":
        return "bg-primary";
      case "forest":
        return "bg-accent";
      case "shadowlands":
        return "bg-destructive";
      default:
        return "bg-secondary";
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative h-96 md:h-[500px]">
        <ParallaxLayer depth={0.3} className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"
            alt="Fantasy world map"
            className="w-full h-full object-cover"
          />
        </ParallaxLayer>
        
        <div className="absolute inset-0">
          {locations.map((location) => (
            <Link key={location.id} href={`/world/${location.id}`} className="absolute" style={{ top: `${location.mapY}%`, left: `${location.mapX}%`, transform: 'translate(-50%, -50%)' }}>
              <Button
                variant="ghost"
                className={`w-4 h-4 ${getLocationColor(location.type)} rounded-full animate-pulse hover:scale-150 transition-transform p-0`}
                data-testid={`button-location-${location.id}`}
              >
                <span className="sr-only">{location.name}</span>
              </Button>
            </Link>
          ))}
        </div>

        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-4">
            <h4 className="font-display text-lg font-semibold text-foreground mb-2" data-testid={`text-selected-location-${selectedLocation.id}`}>
              {selectedLocation.name}
            </h4>
            <p className="text-muted-foreground text-sm" data-testid={`text-selected-description-${selectedLocation.id}`}>
              {selectedLocation.description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-primary hover:text-accent"
              onClick={() => setSelectedLocation(null)}
              data-testid="button-close-location"
            >
              Close
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-6 bg-muted/50">
        <ParallaxLayer depth={0.6} className="w-full">
          <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-display text-lg font-semibold text-card-foreground mb-2" data-testid="text-kingdoms-count">
              7 Kingdoms
            </h4>
            <p className="text-muted-foreground text-sm">Each with unique cultures and magical traditions</p>
          </div>
          <div className="text-center">
            <h4 className="font-display text-lg font-semibold text-card-foreground mb-2" data-testid="text-ruins-count">
              Ancient Ruins
            </h4>
            <p className="text-muted-foreground text-sm">Mysterious locations hiding powerful artifacts</p>
          </div>
          <div className="text-center">
            <h4 className="font-display text-lg font-semibold text-card-foreground mb-2" data-testid="text-realms-count">
              Magical Realms
            </h4>
            <p className="text-muted-foreground text-sm">Hidden dimensions accessible through portals</p>
          </div>
          </div>
        </ParallaxLayer>
      </CardContent>
    </Card>
  );
}
