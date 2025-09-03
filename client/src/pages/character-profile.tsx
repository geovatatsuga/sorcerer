import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { Character } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CharacterProfile() {
  const params = useParams();
  const id = params.id as string | undefined;
  const { language, t } = useLanguage();
  const { data: character } = useQuery<Character | null>({ queryKey: ['/api/characters', id], queryFn: async () => {
    if (!id) return null;
    const res = await fetch(`/api/characters/${id}`);
    if (!res.ok) return null;
    return res.json();
  }});

  const [story, setStory] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !character) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/dev/translations/characters/${id}?lang=${language}`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.translation) {
          setStory(json.translation.description ?? character.description);
          setTitle(json.translation.title ?? character.title);
        } else {
          setStory(character.description);
          setTitle(character.title);
        }
      } catch (e) {
        setStory(character.description);
        setTitle(character.title);
      }
    })();
    return () => { cancelled = true; };
  }, [id, character, language]);

  if (!character) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">Personagem não encontrado</CardContent>
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
        <div className="flex items-center gap-6 mb-6">
          {character.imageUrl && <img src={character.imageUrl} alt={character.name} className="w-36 h-44 object-cover rounded" />}
          <div>
            <h1 className="text-3xl font-bold">{title ?? character.title}</h1>
            <p className="text-muted-foreground mt-2">{character.name} • {character.role}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-xl mb-4">{t.story}</h3>
            <div className="prose max-w-none">
              <p>{story}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild>
            <a href="/characters">{t.backToCharacters}</a>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
