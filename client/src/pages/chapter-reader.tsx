import { useParams, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ReadingProgress from "@/components/reading-progress";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Bookmark, Settings, Image as ImageIcon, Moon, Scroll, BookOpen, Check, Type } from "lucide-react";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { useLanguage } from '@/contexts/LanguageContext';
import type { Chapter } from "@shared/schema";
import DOMPurify from 'dompurify';
import { useImageLightbox } from '@/components/image-lightbox';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichEditor from "@/components/rich-editor";
import { ChapterForm } from './admin';
import { useState, useEffect, useRef } from "react";
import { useAudio } from '@/contexts/AudioProvider';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { bumpRevision } from "@/lib/revision";
import { authHeaders } from "@/lib/authHeaders";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type ReaderTheme = 'dark' | 'parchment' | 'sepia';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export default function ChapterReader() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const auth = useAuth();
  const isAdmin = auth?.isAdmin;
  const queryClient = useQueryClient();
  const { setEntity } = useAudio();
  
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sorcerer_reader_theme');
      if (saved === 'dark' || saved === 'parchment' || saved === 'sepia') return saved;
    }
    return 'dark';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sorcerer_reader_fontsize');
      if (saved === 'sm' || saved === 'md' || saved === 'lg' || saved === 'xl') return saved;
    }
    return 'md';
  });

  const handleThemeChange = (theme: ReaderTheme) => {
    setReaderTheme(theme);
    try {
      localStorage.setItem('sorcerer_reader_theme', theme);
    } catch {}
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem('sorcerer_reader_fontsize', size);
    } catch {}
  };

  const { data: chapter, isLoading } = useQuery<Chapter>({
    queryKey: ['/api/chapters', slug],
    enabled: !!slug,
  });

  const { data: allChapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { language, t } = useLanguage();

  const { open: openImageLightbox } = useImageLightbox();

  const [images, setImages] = useState<string[]>([]);
  const galleryContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const contentImgs = chapter?.content ? Array.from(new DOMParser().parseFromString(chapter.content || '', 'text/html').querySelectorAll('img')).map(i => (i as HTMLImageElement).src).filter(Boolean) : [];
      const metaImgs = Array.isArray((chapter as any)?.images) ? (chapter as any).images.map((it: any) => (typeof it === 'string' ? it : it?.src)).filter(Boolean) : [];
      // merge, keeping meta images first (these can be "invisible" in the editor but still appear in gallery)
      const merged = Array.from(new Set([...metaImgs, ...contentImgs]));
      setImages(merged);
    } catch (e) {
      setImages([]);
    }
  }, [chapter?.content, (chapter as any)?.images]);

  const { progress } = useReadingProgress(chapter?.id || '');

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (chapter && isEditing) {
      setTitle(chapter.title || '');
      setSubtitle(chapter.excerpt || '');
      setContent(chapter.content || '');
    }
  }, [chapter, isEditing]);

  const generateSlug = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const estimateReadingTime = (html: string) => {
    const wordCount = (html || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 250));
  };

  const updateChapter = useMutation({
    mutationFn: async (payload: any) => {
      if (!chapter) return;
      const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: authHeaders({ 'content-type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Update failed' }));
        throw new Error(err.message || 'Update failed');
      }
      return res.json();
    },
    onSuccess: () => {
      bumpRevision();
      queryClient.invalidateQueries({ queryKey: ['/api/chapters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', slug] });
      toast({ title: 'Capítulo atualizado com sucesso!' });
      setIsEditing(false);
    },
    onError: (e: any) => {
      toast({ title: 'Erro ao atualizar capítulo', description: String(e?.message || e), variant: 'destructive' });
    },
  });

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
                {t.chapterNotFound || 'Capítulo não encontrado'}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t.chapterNotFoundDesc || 'O capítulo que você procura não existe ou foi movido.'}
              </p>
              <Link href="/chapters">
                <Button data-testid="button-back-to-chapters">
                  {t.backToChapters || 'Voltar aos capítulos'}
                </Button>
              </Link>
          </div>
        </main>
      </div>
    );
  }

  // Set global audio context to this chapter while reading
  useEffect(() => {
    if (chapter?.id) {
      setEntity({ type: 'chapter', id: chapter.id });
    }
    return () => { setEntity(null); };
  }, [chapter?.id, setEntity]);

  // Ensure deterministic navigation order: by arcNumber asc, then chapterNumber asc, then publishedAt asc
  const sortedChapters = [...allChapters].sort((a, b) => {
    const aArc = (a as any).arcNumber ?? Number.POSITIVE_INFINITY;
    const bArc = (b as any).arcNumber ?? Number.POSITIVE_INFINITY;
    if (aArc !== bArc) return aArc - bArc;
    const aNum = (a.chapterNumber ?? Number.POSITIVE_INFINITY);
    const bNum = (b.chapterNumber ?? Number.POSITIVE_INFINITY);
    if (aNum !== bNum) return aNum - bNum;
    const aDate = new Date(a.publishedAt).getTime();
    const bDate = new Date(b.publishedAt).getTime();
    return aDate - bDate;
  });

  const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
  const previousChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  const localized = (item: any, field: string) => {
    try {
      return item?.[field] || '';
    } catch (e) {
      return item?.[field] || '';
    }
  };

  const fontSizeClass = {
    sm: "text-[16px] leading-[1.8] [&_p]:text-[16px] [&_p]:leading-[1.8]",
    md: "text-[18px] leading-[1.9] [&_p]:text-[18px] [&_p]:leading-[1.9]",
    lg: "text-[21px] leading-[2.0] [&_p]:text-[21px] [&_p]:leading-[2.0]",
    xl: "text-[24px] leading-[2.1] [&_p]:text-[24px] [&_p]:leading-[2.1]",
  }[fontSize];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card 
            className={cn(
              "rounded-xl overflow-hidden transition-all duration-300",
              readerTheme === 'parchment' ? "reader-theme-parchment shadow-2xl" :
              readerTheme === 'sepia' ? "reader-theme-sepia shadow-2xl" :
              "bg-card border border-border"
            )}
          >
            <div className={cn(
              "flex items-center justify-between p-6 border-b transition-colors duration-300 reader-header",
              readerTheme === 'parchment' ? "border-[#decfae]" :
              readerTheme === 'sepia' ? "border-[#3f2f22]" :
              "border-border"
            )}>
              <div className="flex items-center gap-4">
                {images.length > 0 && (
                  <button
                    onClick={() => {
                      try {
                        openImageLightbox(images[0], `${chapter.title} — Ilustrações`, galleryContainerRef.current);
                      } catch {}
                    }}
                    title={images.length === 1 ? '1 ilustração' : `${images.length} ilustrações`}
                    data-testid="button-chapter-images-left"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl shadow-sm transition-all",
                      readerTheme === 'parchment'
                        ? "bg-[#e5d5ad] border border-[#d1bf96] text-[#4a371e] hover:bg-[#d9c79b]"
                        : readerTheme === 'sepia'
                        ? "bg-[#33261c] border border-[#4d3a2b] text-[#edd9c0] hover:bg-[#3d2e22]"
                        : "bg-gradient-to-br from-amber-400/6 to-amber-200/4 hover:shadow-md"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-full p-1.5",
                      readerTheme === 'parchment' ? "bg-[#d8c599] text-[#7a280e]" :
                      readerTheme === 'sepia' ? "bg-[#433224] text-[#f59e0b]" :
                      "bg-amber-400/12"
                    )}>
                      <ImageIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="text-left leading-tight">
                      <div className={cn(
                        "text-sm font-medium",
                        readerTheme === 'parchment' ? "text-[#241a0e] font-semibold" :
                        readerTheme === 'sepia' ? "text-[#faeedd]" :
                        "text-amber-100"
                      )}>
                        {images.length} {images.length === 1 ? 'Ilustração' : 'Ilustrações'}
                      </div>
                      <div className={cn(
                        "text-xs",
                        readerTheme === 'parchment' ? "text-[#6e583c]" :
                        readerTheme === 'sepia' ? "text-[#a89078]" :
                        "text-muted-foreground"
                      )}>
                        Clique para abrir a galeria
                      </div>
                    </div>
                  </button>
                )}

                {/* Hidden gallery source for ImageLightbox (meta/gallery images) */}
                <div ref={galleryContainerRef} className="content hidden" aria-hidden>
                  {images.map((u, i) => (
                    <img key={u + i} src={u} alt="" />
                  ))}
                </div>
                <div>
                  <h1 className={cn(
                    "font-display text-2xl font-semibold",
                    readerTheme === 'parchment' ? "text-[#22170b]" :
                    readerTheme === 'sepia' ? "text-[#faeedd]" :
                    "text-card-foreground"
                  )} data-testid="text-chapter-title">
                    {localized(chapter, 'title')}
                  </h1>
                  <p className={cn(
                    "text-sm",
                    readerTheme === 'parchment' ? "text-[#6e583c] font-medium" :
                    readerTheme === 'sepia' ? "text-[#a89078]" :
                    "text-muted-foreground"
                  )} data-testid="text-chapter-meta">
                    {(chapter as any).arcNumber ? `Arco ${(chapter as any).arcNumber}${(chapter as any).arcTitle ? `: ${(chapter as any).arcTitle}` : ''} • ` : ''}
                    {t.published || 'Publicado'} {new Date(chapter.publishedAt).toLocaleDateString()} • {chapter.readingTime} {t.minRead || 'min'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Theme & Display Options Dropdown right where requested */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-sm",
                        readerTheme === 'parchment' 
                          ? "bg-[#e5d5ad] border-[#d1bf96] text-[#4a371e] hover:bg-[#d9c79b] hover:text-[#22170b]" 
                          : readerTheme === 'sepia'
                          ? "bg-[#33261c] border-[#4d3a2b] text-[#edd9c0] hover:bg-[#3d2e22]"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                      )}
                      title="Aparência de Leitura: Modo Escuro / Papel Antigo / Sépia"
                      data-testid="button-reader-theme-dropdown"
                    >
                      {readerTheme === 'parchment' && <Scroll className="h-4 w-4 text-[#8c2b0c]" />}
                      {readerTheme === 'sepia' && <BookOpen className="h-4 w-4 text-[#f59e0b]" />}
                      {readerTheme === 'dark' && <Moon className="h-4 w-4 text-amber-400" />}
                      <span className="text-xs font-semibold hidden md:inline">
                        {readerTheme === 'parchment' ? 'Papel Antigo' : readerTheme === 'sepia' ? 'Sépia' : 'Tema Noturno'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2.5 bg-[#12141c] border-[#222738] text-slate-200 shadow-2xl z-50 rounded-xl">
                    <DropdownMenuLabel className="text-[11px] uppercase font-bold text-amber-400/90 tracking-wider px-2 py-1">
                      Fundo & Tema de Leitura
                    </DropdownMenuLabel>

                    <DropdownMenuItem 
                      onClick={() => handleThemeChange('dark')}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors mb-1",
                        readerTheme === 'dark' ? "bg-amber-400/15 text-amber-300 font-semibold" : "hover:bg-white/5 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-[#0c0d12] border border-slate-600 inline-block shadow-sm" />
                        <span>🌙 Noturno (Escuro)</span>
                      </div>
                      {readerTheme === 'dark' && <Check className="h-4 w-4 text-amber-400" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleThemeChange('parchment')}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors mb-1",
                        readerTheme === 'parchment' ? "bg-amber-400/15 text-amber-300 font-semibold" : "hover:bg-white/5 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-[#f4ebd0] border border-[#cbbb93] inline-block shadow-sm" />
                        <span>📜 Papel Antigo (Bege)</span>
                      </div>
                      {readerTheme === 'parchment' && <Check className="h-4 w-4 text-amber-400" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleThemeChange('sepia')}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
                        readerTheme === 'sepia' ? "bg-amber-400/15 text-amber-300 font-semibold" : "hover:bg-white/5 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-[#241c16] border border-[#544131] inline-block shadow-sm" />
                        <span>🕯️ Sépia Suave</span>
                      </div>
                      {readerTheme === 'sepia' && <Check className="h-4 w-4 text-amber-400" />}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#222738] my-2" />

                    <DropdownMenuLabel className="text-[11px] uppercase font-bold text-amber-400/90 tracking-wider px-2 py-1 flex items-center justify-between">
                      <span>Tamanho do Texto</span>
                      <Type className="h-3.5 w-3.5 text-slate-400" />
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-lg border border-[#222738] mt-1">
                      {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={cn(
                            "py-1.5 rounded-md text-xs font-bold transition-all",
                            fontSize === size 
                              ? "bg-amber-400 text-black shadow-sm" 
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          )}
                        >
                          {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Padrão' : size === 'lg' ? 'Grande' : 'Enorme'}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {previousChapter && (
                  <Link href={`/chapters/${previousChapter.slug}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={cn(
                        "transition-colors",
                        readerTheme === 'parchment' ? "text-[#6e583c] hover:text-[#22170b] hover:bg-[#e4d4b1]" :
                        readerTheme === 'sepia' ? "text-[#a89078] hover:text-[#faeedd]" :
                        "text-muted-foreground hover:text-primary"
                      )}
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
                  className={cn(
                    "transition-colors",
                    readerTheme === 'parchment' ? "text-[#6e583c] hover:text-[#22170b] hover:bg-[#e4d4b1]" :
                    readerTheme === 'sepia' ? "text-[#a89078] hover:text-[#faeedd]" :
                    "text-muted-foreground hover:text-primary"
                  )}
                  title={t.bookmark || 'Favoritar'}
                  data-testid="button-bookmark"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "transition-colors",
                      readerTheme === 'parchment' ? "text-[#6e583c] hover:text-[#22170b] hover:bg-[#e4d4b1]" :
                      readerTheme === 'sepia' ? "text-[#a89078] hover:text-[#faeedd]" :
                      "text-muted-foreground hover:text-primary"
                    )}
                    title={isEditing ? 'Cancelar edição' : (t.settings || 'Editar capítulo')}
                    data-testid="button-settings"
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                {nextChapter && (
                  <Link href={`/chapters/${nextChapter.slug}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={cn(
                        "transition-colors",
                        readerTheme === 'parchment' ? "text-[#6e583c] hover:text-[#22170b] hover:bg-[#e4d4b1]" :
                        readerTheme === 'sepia' ? "text-[#a89078] hover:text-[#faeedd]" :
                        "text-muted-foreground hover:text-primary"
                      )}
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
              {isAdmin && isEditing ? (
                <div data-testid="chapter-inline-editor">
                  <ChapterForm
                    initial={chapter}
                    onSubmit={async (payload) => {
                      await updateChapter.mutateAsync(payload);
                    }}
                    isSaving={updateChapter.isPending}
                  />
                  <div className="flex gap-3 justify-end mt-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-none" data-testid="content-chapter-text">
                  <div className={cn(
                    "rounded-xl border p-6 sm:p-8 transition-colors duration-300 reader-text-container",
                    readerTheme === 'parchment' ? "bg-[#fcf8ec] border-[#e0d2b4] shadow-sm" :
                    readerTheme === 'sepia' ? "bg-[#18120d] border-[#33261c]" :
                    "bg-black/20 border-border"
                  )}>
                    <article className={cn(
                      "max-w-none content-prose reader-body transition-all duration-200",
                      readerTheme === 'parchment' ? "prose text-[#241c12]" :
                      readerTheme === 'sepia' ? "prose prose-invert text-[#d8c7a6]" :
                      "prose prose-invert text-slate-200",
                      fontSizeClass
                    )}>
                      <div className="whitespace-normal break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapter.content ?? '') }} onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target && target.tagName === 'IMG') {
                              const img = target as HTMLImageElement;
                              // open lightbox
                              try { (window as any).__openImageLightbox(img.src, img.alt || '', img); } catch {}
                            }
                          }} />
                    </article>
                  </div>
                </div>
              )}

              <ReadingProgress progress={progress} />
              
              {/* Chapter Navigation */}
              <div className={cn(
                "flex justify-between items-center mt-12 pt-8 border-t transition-colors duration-300",
                readerTheme === 'parchment' ? "border-[#decfae]" :
                readerTheme === 'sepia' ? "border-[#3f2f22]" :
                "border-border"
              )}>
                {previousChapter ? (
                  <Link href={`/chapters/${previousChapter.slug}`}>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "flex items-center gap-2 transition-colors",
                        readerTheme === 'parchment' ? "border-[#d8c89f] bg-[#ecdfbf] text-[#2c2012] hover:bg-[#e2d2ae] hover:text-[#181109]" :
                        readerTheme === 'sepia' ? "border-[#3f2f22] bg-[#2e221b] text-[#edd9c0] hover:bg-[#3b2c23]" :
                        ""
                      )} 
                      data-testid="button-previous-nav"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t.previous}: {previousChapter.title}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                
                {nextChapter ? (
                  <Link href={`/chapters/${nextChapter.slug}`}>
                    <Button 
                      className={cn(
                        "flex items-center gap-2 transition-colors",
                        readerTheme === 'parchment' ? "bg-[#8c2b0c] text-[#fff8ee] hover:bg-[#722208]" :
                        readerTheme === 'sepia' ? "bg-[#c27803] text-black hover:bg-[#a36502]" :
                        ""
                      )} 
                      data-testid="button-next-nav"
                    >
                      {t.next}: {nextChapter.title}
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


