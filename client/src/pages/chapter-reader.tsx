import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ReadingProgress from "@/components/reading-progress";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Bookmark, Settings } from "lucide-react";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { useLanguage } from '@/contexts/LanguageContext';
import type { Chapter } from "@shared/schema";

export default function ChapterReader() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: chapter, isLoading } = useQuery<Chapter>({
    queryKey: ['/api/chapters', slug],
    enabled: !!slug,
  });

  const { data: allChapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { progress } = useReadingProgress(chapter?.id || '');

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

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-3xl font-bold text-destructive mb-4" data-testid="text-chapter-not-found">
              Chapter Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The chapter you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/chapters">
              <Button data-testid="button-back-to-chapters">
                Back to Chapters
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const { language, t } = useLanguage();

  const localized = (item: any, field: string) => {
    try {
      return (item?.[`${field}I18n`]?.[language] as string) || item?.[field] || '';
    } catch (e) {
      return item?.[field] || '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h1 className="font-display text-2xl font-semibold text-card-foreground" data-testid="text-chapter-title">
                  {`${t.title} ${chapter.chapterNumber}: ${localized(chapter, 'title')}`}
                </h1>
                <p className="text-muted-foreground text-sm" data-testid="text-chapter-meta">
                  {t.published} {new Date(chapter.publishedAt).toLocaleDateString()} • {chapter.readingTime} {t.minRead}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {previousChapter && (
                  <Link href={`/chapters/${previousChapter.slug}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={t.previous}
                      data-testid="button-previous-chapter"
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
                {nextChapter && (
                  <Link href={`/chapters/${nextChapter.slug}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={t.next}
                      data-testid="button-next-chapter"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none" data-testid="content-chapter-text">
                { (localized(chapter, 'content') || chapter.content).split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="text-card-foreground leading-relaxed mb-6 text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <ReadingProgress progress={progress} />
              
              {/* Chapter Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
                {previousChapter ? (
                  <Link href={`/chapters/${previousChapter.slug}`}>
                    <Button variant="outline" className="flex items-center gap-2" data-testid="button-previous-nav">
                      <ChevronLeft className="h-4 w-4" />
                      {t.previous}: {(previousChapter.titleI18n as any)?.[language] ?? previousChapter.title}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                
                {nextChapter ? (
                  <Link href={`/chapters/${nextChapter.slug}`}>
                    <Button className="flex items-center gap-2" data-testid="button-next-nav">
                      {t.next}: {(nextChapter.titleI18n as any)?.[language] ?? nextChapter.title}
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
