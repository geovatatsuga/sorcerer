import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import type { Location } from "@shared/schema";

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();

  const { data: location, isLoading } = useQuery<Location>({
    queryKey: ['/api/locations', id],
    queryFn: async () => {
      const res = await fetch(`/api/locations/${id}`);
      if (!res.ok) throw new Error('Failed to fetch location');
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl h-96 animate-pulse" />
        </div>
      </main>
    </div>
  );

  if (!location) return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl font-bold text-destructive mb-4">{t.noLocations}</h1>
          <p className="text-muted-foreground">{t.locationsWillAppear}</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-border rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h1 className="font-display text-2xl font-semibold text-card-foreground mb-2">{(location.nameI18n as any)?.[language] ?? location.name}</h1>
              <p className="text-muted-foreground mb-4">{(location.descriptionI18n as any)?.[language] ?? location.description}</p>
              <div className="flex gap-2">
                <Link href="/world"><Button variant="ghost">{t.world}</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
