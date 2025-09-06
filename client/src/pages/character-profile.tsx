import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { Character } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Bookmark, Settings } from 'lucide-react';

export default function CharacterProfile() {
  const params = useParams() as Record<string, string | undefined>;
  // Support both /characters/:slug and older /characters/:id
  const idOrSlug = (params.slug ?? params.id) as string | undefined;
  const { t } = useLanguage();

  const { data: character, isLoading } = useQuery<Character | null>({
    queryKey: ['/api/characters', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      // try slug route first
      let res = await fetch(`/api/characters/slug/${idOrSlug}`);
      if (res.ok) return res.json();
      // fallback to id route
      res = await fetch(`/api/characters/${idOrSlug}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!idOrSlug,
  });

  const { data: allCharacters = [] } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });

    // Translation system disabled: use primary (Portuguese) fields only.
    const story = (character as any)?.story ?? character?.description ?? null;
    const title = character?.title ?? null;
    const name = character?.name ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl h-96 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

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

  const currentIndex = allCharacters.findIndex(c => c.id === character.id);
  const previousCharacter = currentIndex > 0 ? allCharacters[currentIndex - 1] : null;
  const nextCharacter = currentIndex < allCharacters.length - 1 ? allCharacters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h1 className="font-display text-2xl font-semibold text-card-foreground" data-testid="text-character-title">
                  {name}
                </h1>
                <p className="text-muted-foreground text-sm" data-testid="text-character-meta">
                  {title} • {character.role}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {previousCharacter && (
                  <Link href={`/characters/${previousCharacter.slug || previousCharacter.id}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Previous Character"
                      data-testid="button-previous-character"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Bookmark"
                  data-testid="button-bookmark"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Settings"
                  data-testid="button-settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                {nextCharacter && (
                  <Link href={`/characters/${nextCharacter.slug || nextCharacter.id}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Next Character"
                      data-testid="button-next-character"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none" data-testid="content-character-text">
                {story ? (
                  <div dangerouslySetInnerHTML={{ __html: story }} />
                ) : (
                  <p className="text-card-foreground leading-relaxed mb-6 text-lg">{character.description}</p>
                )}
              </div>

              {/* Character Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
                {previousCharacter ? (
                  <Link href={`/characters/${previousCharacter.slug || previousCharacter.id}`}>
                    <Button variant="outline" className="flex items-center gap-2" data-testid="button-previous-nav">
                      <ChevronLeft className="h-4 w-4" />
                      Previous: {previousCharacter.name}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                
                {nextCharacter ? (
                  <Link href={`/characters/${nextCharacter.slug || nextCharacter.id}`}>
                    <Button className="flex items-center gap-2" data-testid="button-next-nav">
                      Next: {nextCharacter.name}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
