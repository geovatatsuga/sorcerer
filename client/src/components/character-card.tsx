import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@shared/schema";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from '@tanstack/react-query';

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

  // Translation system disabled: always use primary (Portuguese) fields.
  useLanguage();
  const title = character.title;
  const story = (character as any).story ?? character.description;

  const linkTarget = character.slug || character.id;

  return (
    <Link href={`/characters/${linkTarget}`} className="block">
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
            <span dangerouslySetInnerHTML={{ __html: story || '' }} />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
