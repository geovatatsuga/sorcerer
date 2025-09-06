import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import WorldMap from "@/components/world-map";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import type { Location } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';

export default function World() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  const [, setLocation] = useLocation();

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4" data-testid="text-world-title">
              {t.worldTitle || 'Explore o Mundo'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.worldDesc || 'Mapa interativo e locais do reino.'}
            </p>
          </div>
          
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl h-96 animate-pulse mb-16" />
          ) : (
            <div className="mb-16">
              <WorldMap locations={locations} />
            </div>
          )}
          
          {/* Location Details */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-64 animate-pulse" />
              ))
      ) : locations.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-4" data-testid="text-no-locations">
                    {t.noLocations || 'Ainda não há locais'}
                  </h3>
                  <p className="text-muted-foreground">
                    {t.locationsWillAppear || 'Os locais aparecerão aqui quando estiverem disponíveis.'}
                  </p>
              </div>
            ) : (
              locations.map((location) => (
                <Card key={location.id} className="bg-card border border-border rounded-lg hover-glow cursor-pointer transition-transform hover:scale-105">
                  <CardContent className="p-6" onClick={() => setLocation(`/world/${location.id}`)}>
                    <h3 className="font-display text-xl font-semibold text-card-foreground mb-3" data-testid={`text-location-name-${location.id}`}>
                      {location.name}
                    </h3>
                    <div className="text-accent text-sm font-medium mb-3 capitalize" data-testid={`text-location-type-${location.id}`}>
                      {location.type}
                    </div>
                    <p className="text-muted-foreground text-sm" data-testid={`text-location-description-${location.id}`}>
                      <span dangerouslySetInnerHTML={{ __html: location.description ?? '' }} />
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


