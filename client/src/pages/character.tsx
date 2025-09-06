import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import type { Character } from "@shared/schema";

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['/api/characters', id],
    queryFn: async () => {
      const res = await fetch(`/api/characters/${id}`);
      if (!res.ok) throw new Error('Failed to fetch character');
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

  if (!character) return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl font-bold text-destructive mb-4">{t.noCharacters}</h1>
          <p className="text-muted-foreground">{t.adjustFilters}</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  const localized = (field: string, i18n?: any) => (i18n?.[language] as string) || (character as any)[field] || '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-border rounded-xl overflow-hidden">
            {character.imageUrl && <img src={character.imageUrl} alt={character.name} className="w-full h-64 object-cover" />}
            <CardContent className="p-6">
              <h1 className="font-display text-2xl font-semibold text-card-foreground mb-2">{character.name}</h1>
              <p className="text-muted-foreground mb-4">{localized('description', (character as any).descriptionI18n)}</p>
              <div className="flex gap-2">
                <Button variant="outline">{t.backToChapters}</Button>
                <Link href="/characters"><Button variant="ghost">{t.characters}</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
