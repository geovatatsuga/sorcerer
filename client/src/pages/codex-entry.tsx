<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { CodexEntry } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wand2, Crown, MapPin } from 'lucide-react';

export default function CodexEntryProfile() {
  const params = useParams() as Record<string, string | undefined>;
  const id = params.id as string | undefined;
  const { t } = useLanguage();
  const { data: entry } = useQuery<CodexEntry | null>({ 
    queryKey: ['/api/codex', id], 
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/codex/${id}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Translation disabled: always use primary fields
  const title = entry?.title ?? null;
  const description = entry?.description ?? null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "magic":
        return <Wand2 className="h-6 w-6" />;
      case "creatures":
        return <Crown className="h-6 w-6" />;
      case "locations":
        return <MapPin className="h-6 w-6" />;
      default:
        return <Wand2 className="h-6 w-6" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "magic":
        return "Magia";
      case "creatures":
        return "Criaturas";
      case "locations":
        return "Localizações";
      default:
        return category;
    }
  };

  if (!entry) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">Entrada do Codex não encontrada</CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
=======
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import type { CodexEntry } from "@shared/schema";

export default function CodexEntryPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();

  const { data: entry, isLoading } = useQuery<CodexEntry>({
    queryKey: ['/api/codex', id],
    queryFn: async () => {
      const res = await fetch(`/api/codex/${id}`);
      if (!res.ok) throw new Error('Failed to fetch codex entry');
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

  if (!entry) return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl font-bold text-destructive mb-4">{t.codexPageTitle}</h1>
          <p className="text-muted-foreground">{t.codexPageDesc}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
<<<<<<< HEAD
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-6">
          {entry.imageUrl && (
            <img 
              src={entry.imageUrl} 
              alt={title ?? entry.title} 
              className="w-36 h-44 object-cover rounded" 
            />
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                {getCategoryIcon(entry.category)}
              </div>
              <span className="text-accent font-medium capitalize">
                {getCategoryName(entry.category)}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{title ?? entry.title}</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-xl mb-4">Descrição</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description ?? entry.description }} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Informações</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="capitalize">{getCategoryName(entry.category)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{entry.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild>
            <a href="/codex">← Voltar ao Codex</a>
          </Button>
        </div>
      </div>
=======
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-border rounded-xl overflow-hidden">
            {entry.imageUrl && <img src={entry.imageUrl} alt={(entry.titleI18n as any)?.[language] ?? entry.title} className="w-full h-64 object-cover" />}
            <CardContent className="p-6">
              <h1 className="font-display text-2xl font-semibold text-card-foreground mb-2">{(entry.titleI18n as any)?.[language] ?? entry.title}</h1>
              <p className="text-muted-foreground mb-4">{(entry.descriptionI18n as any)?.[language] ?? entry.description}</p>
              <div className="flex gap-2">
                <Link href="/codex"><Button variant="ghost">{t.codex}</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
      <Footer />
    </div>
  );
}
