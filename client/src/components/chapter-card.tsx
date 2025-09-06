import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Chapter } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const { t } = useLanguage();
  // Translation system disabled: always use primary (Portuguese) fields
  const translation = null;

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t.oneDayAgo;
    if (diffDays < 7) return `${diffDays} ${t.daysAgo}`;
    if (diffDays < 14) return t.oneWeekAgo;
    if (diffDays < 21) return t.twoWeeksAgo;
    return t.threeWeeksAgo;
  };

  const { language } = useLanguage();

  const localized = (field: string | null | undefined, i18n?: Record<string, string> | null) => {
    if (!field && !i18n) return '';
    if (i18n && i18n[language]) return i18n[language];
    return field || '';
  };

  return (
    <Link href={`/chapters/${chapter.slug}`} className="block">
      <Card className="chapter-card bg-card border border-border rounded-lg overflow-hidden hover-glow">
      {chapter.imageUrl && (
        <img 
          src={chapter.imageUrl} 
          alt={chapter.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-accent font-medium" data-testid={`text-chapter-${chapter.chapterNumber}`}>
            {t.chapterLabel} {chapter.chapterNumber}
          </span>
          <span className="text-sm text-muted-foreground" data-testid={`text-date-${chapter.slug}`}>
            {timeAgo(chapter.publishedAt)}
          </span>
        </div>
          <h3 className="font-display text-xl font-semibold text-card-foreground mb-3" data-testid={`text-title-${chapter.slug}`}>
          {localized(chapter.title, chapter.titleI18n as any)}
        </h3>
          <p className="text-muted-foreground text-sm mb-4" data-testid={`text-excerpt-${chapter.slug}`}>
          <span dangerouslySetInnerHTML={{ __html: chapter.excerpt || '' }} />
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span data-testid={`text-reading-time-${chapter.slug}`}>
              {chapter.readingTime} {t.minRead}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-accent transition-colors p-2"
            data-testid={`button-read-${chapter.slug}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}


