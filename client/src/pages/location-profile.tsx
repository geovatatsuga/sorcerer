import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { Location } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LocationProfile(props?: any) {
  const paramsFromHook = useParams() as Record<string, string | undefined>;
  // wouter may pass route params via props.params when using the `component` prop on Route.
  // Prefer explicit props.params.id when present, then fallback to hook.
  const id = (props?.params?.id ?? paramsFromHook?.id ?? props?.id) as string | undefined;
  const { t } = useLanguage();
  const { data: location, isLoading } = useQuery<Location | null>({ 
    queryKey: ['/api/locations', id], 
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      // Try direct fetch by id first
      try {
        const res = await fetch(`/api/locations/${id}`);
        if (res.ok) return res.json();
      } catch (e) {
        // ignore and fallback
      }

      // Fallback: fetch all locations and try to match by id or by slugified name
      try {
        const listRes = await fetch('/api/locations');
        if (!listRes.ok) return null;
        const arr: Location[] = await listRes.json();
        // exact id match
        const byId = arr.find((l) => l.id === id);
        if (byId) return byId;
        // try matching by slugified name (e.g., '/world/reino-de-valaria')
        const slugCandidate = String(id).toLowerCase();
        const byName = arr.find((l) => {
          const slug = (l.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return slug === slugCandidate || l.name?.toLowerCase() === slugCandidate;
        });
        if (byName) return byName;
      } catch (e) {
        // ignore
      }

      return null;
    }
  });

  // Translation disabled: use primary fields only
  const name = location?.name ?? null;
  const description = location?.description ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">Carregando localização...</CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">Localização não encontrada</CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{name ?? location.name}</h1>
          <p className="text-muted-foreground mt-2 capitalize">
            {location.type} • Coordenadas: {location.mapX}%, {location.mapY}%
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-xl mb-4">Descrição</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description ?? location.description }} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Informações Técnicas</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="capitalize">{location.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posição no Mapa:</span>
                <span>X: {location.mapX}%, Y: {location.mapY}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{location.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild>
            <a href="/world">← Voltar ao Mundo</a>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
