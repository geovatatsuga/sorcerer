import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@shared/schema";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "protagonist":
        return "text-primary";
      case "antagonist":
        return "text-destructive";
      default:
        return "text-accent";
    }
  };

  const { language } = useLanguage();
  const [title, setTitle] = useState(character.title);
  const [description, setDescription] = useState(character.description);

  useEffect(() => {
    let cancelled = false;
    // Try dev translation endpoint first (safe fallback to original)
    (async () => {
      try {
        const res = await fetch(`/api/dev/translations/characters/${character.id}?lang=${language}`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json?.translation) {
          // translation shape for characters: { name?, title?, description? }
          setTitle(json.translation.title ?? character.title);
          setDescription(json.translation.description ?? character.description);
        } else {
          // no translation stored, fallback
          setTitle(character.title);
          setDescription(character.description);
        }
      } catch (err) {
        // ignore and fallback
        setTitle(character.title);
        setDescription(character.description);
      }
    })();
    return () => { cancelled = true; };
  }, [language, character.id, character.title, character.description]);

  return (
    <Link href={`/characters/${character.id}`} className="block">
      <Card className="bg-card border border-border rounded-lg overflow-hidden hover-glow">
        {character.imageUrl && (
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className="w-full h-64 object-cover"
            data-testid={`img-character-${character.id}`}
          />
        )}
        <CardContent className="p-6">
          <h3 className="font-display text-xl font-semibold text-card-foreground mb-2" data-testid={`text-name-${character.id}`}>
            {character.name}
          </h3>
          <p className={`text-sm font-medium mb-3 ${getRoleColor(character.role)}`} data-testid={`text-title-${character.id}`}>
            {title}
          </p>
          <p className="text-muted-foreground text-sm" data-testid={`text-description-${character.id}`}>
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
