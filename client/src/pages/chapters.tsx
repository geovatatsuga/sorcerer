import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Chapter } from "@shared/schema";
// translations removed — single-language
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, X, RefreshCw, ArrowDownNarrowWide, ArrowUpNarrowWide, BookOpen, Star, ChevronDown, Grid3X3, Menu, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Chapters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [arcFilter, setArcFilter] = useState<string>("");
  // single-language: use primary fields only
  
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { t } = useLanguage();

  const localizedFields = (item: any, field: string) => item?.[field] || '';

  // Ordenação e visualização (declarar antes dos efeitos que usam)
  type SortMode = 'number-asc' | 'date-desc' | 'date-asc';
  const [sortMode, setSortMode] = useState<SortMode>('number-asc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Busca inteligente com debounce
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchQuery(searchQuery), 200);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Sync estado <-> URL (compartilhável)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) params.set('q', searchQuery); else params.delete('q');
    if (chapterNumber) params.set('ch', chapterNumber); else params.delete('ch');
    if (arcFilter) params.set('arc', arcFilter); else params.delete('arc');
    if (viewMode !== 'cards') params.set('view', viewMode); else params.delete('view');
    params.set('sort', sortMode);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, chapterNumber, arcFilter, viewMode, sortMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const ch = params.get('ch');
    const ar = params.get('arc');
    const vw = params.get('view') as 'cards' | 'list' | null;
    const st = params.get('sort') as SortMode | null;
    if (q) setSearchQuery(q);
    if (ch) setChapterNumber(ch);
    if (ar) setArcFilter(ar);
    if (vw) setViewMode(vw);
    if (st) setSortMode(st);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredChapters = chapters.filter((chapter: any) => {
    // Busca considera título, excerpt, número e arco
    const haystack = `${localizedFields(chapter, 'title')} ${localizedFields(chapter, 'excerpt')} ${chapter.chapterNumber ?? ''} ${(chapter.arcNumber ?? '')} ${(chapter.arcTitle ?? '')}`
      .toLowerCase();
    const textMatch = haystack.includes(debouncedSearchQuery.toLowerCase());
    const chapterMatch = chapterNumber
      ? String(chapter.chapterNumber || '').toLowerCase() === String(chapterNumber).toLowerCase()
      : true;
    const arcMatch = arcFilter
      ? `${chapter.arcNumber ?? ''} ${chapter.arcTitle ?? ''}`.toLowerCase().includes(arcFilter.toLowerCase())
      : true;
    return textMatch && chapterMatch && arcMatch;
  });

  // Group chapters by Arc (number + title). Chapters without arc go to "Outros".
  type ArcGroup = { key: string; arcNumber: number | null; arcTitle: string | null; chapters: Chapter[] };

  const arcGroups = useMemo<ArcGroup[]>(() => {
    const map = new Map<string, ArcGroup>();
    for (const ch of filteredChapters) {
      const num = (ch as any).arcNumber ?? null;
      const title = (ch as any).arcTitle ?? null;
      const key = `${num ?? 'none'}|${title ?? ''}`;
      if (!map.has(key)) {
        map.set(key, { key, arcNumber: num, arcTitle: title, chapters: [] });
      }
      map.get(key)!.chapters.push(ch);
    }
    const arr = Array.from(map.values());
    // Sort arcs: numeric first ascending, then nones, then by title
    arr.sort((a, b) => {
      const aNum = a.arcNumber ?? Number.POSITIVE_INFINITY;
      const bNum = b.arcNumber ?? Number.POSITIVE_INFINITY;
      if (aNum !== bNum) return aNum - bNum;
      const aTitle = (a.arcTitle ?? '').toLowerCase();
      const bTitle = (b.arcTitle ?? '').toLowerCase();
      return aTitle.localeCompare(bTitle);
    });
    // Sort chapters inside each arc by selected mode
    for (const g of arr) {
      g.chapters.sort((a, b) => {
        if (sortMode === 'number-asc') {
          return (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0);
        }
        const aDate = new Date(a.publishedAt).getTime();
        const bDate = new Date(b.publishedAt).getTime();
        return sortMode === 'date-desc' ? (bDate - aDate) : (aDate - bDate);
      });
    }
    return arr;
  }, [filteredChapters, sortMode]);

  const arcRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToArc = (key: string) => {
    arcRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chapterImage = (chapter: Chapter) => chapter.imageUrl || "/uploads/hero-arcane-eclipse.png";
  const arcImage = (group: ArcGroup) => chapterImage(group.chapters[0] || ({} as Chapter));

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

  const activeArc = arcGroups[0];

  return (
    <div className="min-h-screen bg-[#02070d] text-foreground relative pl-0 xl:pl-[68px] overflow-x-hidden">
      <Navigation />

      <main className="relative min-h-[calc(100vh-56px)] px-4 pb-16 pt-[72px] lg:min-h-[980px] lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_70%_0%,rgba(216,170,92,0.12),transparent_34%),linear-gradient(to_bottom,rgba(2,7,13,0.1),rgba(2,7,13,1))]" />
        <div className="relative mx-auto grid max-w-[1560px] gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-[82px] rounded border border-primary/15 bg-[#050a0f]/78 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-5 flex items-center justify-center gap-3 text-primary">
                <span className="h-px w-10 bg-primary/35" />
                <span className="font-display text-[12px] uppercase tracking-[0.28em]">Arcos</span>
                <span className="h-px w-10 bg-primary/35" />
              </div>
              <div className="space-y-2">
                {arcGroups.map((group, index) => {
                  const label = `Arco ${group.arcNumber ?? index + 1}`;
                  const title = group.arcTitle || (index === 0 ? 'O Eco do Retorno' : 'Sem titulo');
                  const active = activeArc?.key === group.key || arcFilter.includes(String(group.arcNumber ?? ''));
                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => scrollToArc(group.key)}
                      className={`group relative w-full rounded border px-4 py-3 text-left transition-all ${active ? 'border-primary/35 bg-primary/8 shadow-[inset_2px_0_0_rgba(216,170,92,0.85)]' : 'border-primary/8 bg-[#071018]/60 hover:border-primary/25'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-display text-[13px] text-foreground/85">{label}. {title}</div>
                        <ChevronDown className="h-3.5 w-3.5 text-primary/70" />
                      </div>
                      {active && (
                        <>
                          <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                            {group.chapters[0]?.excerpt?.replace(/<[^>]*>/g, '') || 'A jornada se abre em ecos de magia antiga.'}
                          </p>
                          <div className="mt-3 text-[10px] text-muted-foreground">{group.chapters.length} / {Math.max(group.chapters.length, 12)} capitulos</div>
                          <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-primary/10">
                            <div className="h-full w-2/3 bg-primary" />
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <blockquote className="mt-7 border border-primary/15 bg-[#02070d]/70 px-4 py-5 text-center text-[11px] italic leading-relaxed text-muted-foreground">
                "O conhecimento e uma lamina.<br />E toda lamina carrega um preco."
              </blockquote>
            </div>
          </aside>

          <section>
            <header className="mb-5">
              <h1 className="font-display text-[34px] leading-none text-foreground md:text-[44px]" data-testid="text-chapters-title">
                Todos os Capitulos
              </h1>
              <div className="mt-3 h-px w-full max-w-[520px] bg-gradient-to-r from-primary/60 via-primary/25 to-transparent" />
            </header>

            <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder={t.searchChapters || "Buscar capitulos..."}
                  aria-label="Buscar capitulos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded border-primary/15 bg-[#050a0f]/78 pl-9 pr-8 text-[12px] text-foreground placeholder:text-muted-foreground"
                  style={{ backgroundColor: 'rgba(5, 10, 15, 0.82)', color: 'var(--foreground)' }}
                  data-testid="input-search-chapters"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="btn-clear-search">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant={sortMode === 'date-desc' ? 'default' : 'outline'} size="sm" onClick={() => setSortMode('date-desc')} className="h-10 rounded border-primary/15 bg-[#050a0f]/78 text-[11px]">
                  <ArrowDownNarrowWide className="mr-1 h-3.5 w-3.5" /> Mais recentes
                </Button>
                <Button variant={sortMode === 'number-asc' ? 'default' : 'outline'} size="sm" onClick={() => setSortMode('number-asc')} className="h-10 rounded border-primary/15 bg-[#050a0f]/78 text-[11px]">
                  <ArrowUpNarrowWide className="mr-1 h-3.5 w-3.5" /> Ordem
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setChapterNumber(''); setArcFilter(''); }} className="h-10 rounded text-[11px]">
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Limpar
                </Button>
              </div>
              <div className="flex items-center gap-2 lg:col-span-2">
                {['Todos', 'Lidos', 'Nao lidos', 'Favoritos'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="h-8 rounded border border-primary/15 bg-[#050a0f]/70 px-3 font-display text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('cards')} className="h-10 w-10 rounded border-primary/20" title="Cards">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} className="h-10 w-10 rounded border-primary/20" title="Lista">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-[210px] animate-pulse rounded border border-primary/10 bg-card/40" />)}
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="rounded border border-primary/15 bg-[#050a0f]/75 py-20 text-center">
                <h3 className="font-display text-2xl text-muted-foreground" data-testid="text-no-chapters">{searchQuery ? t.noChaptersFound : t.noChapters}</h3>
                <p className="mt-2 text-muted-foreground">{searchQuery ? t.adjustSearchTerms : t.chaptersWillAppear}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {arcGroups.map((group, groupIndex) => (
                  <section key={group.key} ref={(el) => { arcRefs.current[group.key] = el; }} className="scroll-mt-24 rounded border border-primary/15 bg-[#050a0f]/70 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)]">
                    <div className="relative mb-4 min-h-[150px] overflow-hidden rounded border border-primary/15 p-6">
                      <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${arcImage(group)}')` }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#02070d]/95 via-[#02070d]/65 to-[#02070d]/20" />
                      <img src="/front-ed-assets/icone_runa_compasso.png" alt="" aria-hidden className="absolute left-5 top-1/2 h-24 w-24 -translate-y-1/2 object-contain opacity-20" />
                      <div className="relative z-10 ml-0 md:ml-24">
                        <div className="font-display text-[11px] uppercase tracking-[0.24em] text-primary">Arco {group.arcNumber ?? groupIndex + 1}</div>
                        <h2 className="mt-1 font-display text-2xl text-foreground md:text-3xl">{group.arcTitle || 'O Eco do Retorno'}</h2>
                        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                          {group.chapters[0]?.excerpt?.replace(/<[^>]*>/g, '') || 'Uma colecao de capitulos marcada por magia antiga, escolhas dificeis e ecos de poder.'}
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 h-8 rounded border-primary/25 bg-black/20 text-[10px]" onClick={() => setArcFilter(((group.arcNumber ?? '') + ' ' + (group.arcTitle ?? '')).trim())}>
                          Recolher arco <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {viewMode === 'cards' ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {group.chapters.map((chapter) => (
                          <Link key={chapter.id} href={`/chapters/${chapter.slug}`} className="group relative overflow-hidden rounded border border-primary/15 bg-[#04080e] transition-all hover:border-primary/45 hover:shadow-[0_0_24px_rgba(216,170,92,0.20)]">
                            <div className="relative h-[150px] overflow-hidden">
                              <img src={chapterImage(chapter)} alt="" aria-hidden className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#02070d] via-[#02070d]/45 to-transparent" />
                              <div className="absolute right-3 top-3 flex h-8 w-6 items-center justify-center border border-primary/35 bg-[#02070d]/80 text-primary">
                                <Star className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="mb-1 font-display text-[10px] uppercase tracking-[0.22em] text-primary">Capitulo {chapter.chapterNumber}</div>
                              <h3 className="min-h-[42px] font-display text-[17px] leading-tight text-foreground group-hover:text-primary">{localizedFields(chapter, 'title')}</h3>
                              <div className="mt-3 flex items-center justify-between text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span className="text-[11px]">{timeAgo(chapter.publishedAt)}</span>
                                <CheckCircle2 className="h-4 w-4 text-primary/75" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {group.chapters.map((chapter) => (
                          <Link key={chapter.id} href={`/chapters/${chapter.slug}`} className="flex items-center justify-between rounded border border-primary/12 bg-[#04080e]/80 px-4 py-3 hover:border-primary/35">
                            <div>
                              <div className="font-display text-base text-foreground">Capitulo {chapter.chapterNumber}: {localizedFields(chapter, 'title')}</div>
                              <div className="text-xs text-muted-foreground">{timeAgo(chapter.publishedAt)}</div>
                            </div>
                            <div className="text-xs text-primary">{chapter.readingTime} {t.minRead}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                      <span className="h-px w-24 bg-primary/25" />
                      {group.chapters.length} capitulos
                      <span className="h-px w-24 bg-primary/25" />
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}


