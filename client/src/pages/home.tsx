import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import type { Chapter, BlogPost } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

const FALLBACK_HERO_IMAGE = "/rotativas/ChatGPT Image 1 de jul. de 2026, 14_56_27 (5).png";
const HERO_ROTATION_INTERVAL_MS = 10000;

function shuffleHeroImages(images: string[]) {
  return [...images].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [heroImages, setHeroImages] = useState<string[]>([FALLBACK_HERO_IMAGE]);
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState(0);

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const latestChapters = useMemo(() => {
    return chapters.slice(0, 4);
  }, [chapters]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/hero-rotativas", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.statusText)))
      .then((data: { images?: string[] }) => {
        if (cancelled || !Array.isArray(data.images) || data.images.length === 0) return;
        setHeroImages(shuffleHeroImages(data.images));
        setActiveHeroImageIndex(0);
      })
      .catch(() => {
        if (!cancelled) setHeroImages([FALLBACK_HERO_IMAGE]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (heroImages.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveHeroImageIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, HERO_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  const visibleHeroImages = useMemo(() => {
    const current = heroImages[activeHeroImageIndex] ?? FALLBACK_HERO_IMAGE;
    const previous = heroImages[(activeHeroImageIndex - 1 + heroImages.length) % heroImages.length] ?? current;
    return { current, previous };
  }, [activeHeroImageIndex, heroImages]);

  const currentChapter = chapters[0] || {
    id: "cap-1",
    chapterNumber: 1,
    title: "Capítulo 1 — Prólogo",
    arcNumber: 1,
    slug: "arco-1-o-limiar-capitulo-1-prologo"
  };

  return (
    <div className="min-h-screen bg-[#030508] text-[#e8e4d9] relative pl-0 xl:pl-[68px] overflow-x-hidden font-sans selection:bg-[#d8aa5c]/30">
      <Navigation />

      {/* ════════════════════════════════════════════════════════════════
          FULL-SCREEN CINEMATIC HERO + HUD (Anchored Cleanly to Viewport Bottom)
      ════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden min-h-[calc(100vh-54px)] flex flex-col justify-between mt-[54px] pb-6">
        
        {/* Dynamic Background Image: Radiant, Center-Visible, Soft Lateral Gradients */}
        <div className="hero-home-bg-frame absolute inset-0 z-0 pointer-events-none">
          <img
            key={`home-hero-previous-${visibleHeroImages.previous}`}
            className="hero-home-bg-image absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.12] contrast-[1.08] brightness-[1.02]"
            src={visibleHeroImages.previous}
            alt=""
          />
          <img
            key={`home-hero-current-${visibleHeroImages.current}`}
            className="hero-home-bg-image absolute inset-0 w-full h-full object-cover object-center filter saturate-[1.12] contrast-[1.08] brightness-[1.02] hero-home-bg-current"
            src={visibleHeroImages.current}
            alt=""
          />
          
          {/* Subtle localized dark fade only on the far left behind text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030508]/85 via-[#030508]/45 via-22% to-transparent z-10 pointer-events-none" />
          
          {/* Subtle localized dark fade on the right behind status cards */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#030508]/75 via-transparent to-transparent z-10 pointer-events-none" />
          
          {/* Smooth bottom transition grounding the lower cards */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-[#030508]/50 via-22% to-transparent z-10 pointer-events-none" />
        </div>

        {/* ─── ZONE 1: TOP HERO TITLE & RIGHT STATUS PANELS ─── */}
        <div className="relative z-20 w-full px-6 sm:px-8 lg:px-10 pt-4 pb-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-[1920px] mx-auto">
          
          {/* Left Hero Copy Text */}
          <div className="flex flex-col justify-center max-w-[500px] select-none py-0.5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            <span className="text-[10.5px] tracking-[0.35em] font-sans font-bold text-[#d8aa5c] uppercase mb-0.5">
              › A LENDA RECOMEÇA.
            </span>
            
            <h1 className="font-display uppercase tracking-wide leading-tight">
              <span className="block text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-[#f5f0e6]">
                O Retorno do
              </span>
              <span className="text-[34px] sm:text-[42px] lg:text-[48px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe49e] via-[#dfb15b] to-[#b38536] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                Primeiro Feiticeiro
              </span>
            </h1>

            {/* Ornamental divider */}
            <div className="flex items-center gap-2 my-2 text-[#d8aa5c]/70 text-[9px]">
              <span>✦</span>
              <span className="w-8 h-[1px] bg-[#d8aa5c]/40" />
              <span>✦</span>
            </div>

            <p className="text-[13px] text-[#cfc9b8] leading-relaxed font-medium mb-3.5">
              Magia antiga desperta. Reinos esquecidos tremem.<br />
              Sua lenda está prestes a ser escrita.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <Link 
                href="/chapters"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#dfb15b] via-[#d8aa5c] to-[#b38536] text-black font-bold text-[11px] uppercase tracking-wider shadow-[0_4px_16px_rgba(216,170,92,0.4)] hover:brightness-110 transition-all cursor-pointer group"
              >
                <Sparkles className="h-3 w-3 text-black" />
                <span>Começar a ler</span>
              </Link>
              
              <Link 
                href="/mundo"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#d8aa5c]/45 bg-[#060c14]/85 text-[#e8c87b] text-[11px] font-semibold tracking-wider uppercase backdrop-blur-xl hover:bg-[#d8aa5c]/20 hover:border-[#d8aa5c] transition-all cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.7)]"
              >
                <Compass className="h-3 w-3 text-[#d8aa5c]" />
                <span>Explorar o mundo</span>
              </Link>
            </div>
          </div>

          {/* Right Status Panels (Capítulo Atual & Quote Grimoire) */}
          <div className="hidden lg:flex flex-col items-stretch justify-center gap-2.5 w-[270px] select-none py-0.5">
            
            {/* Card 1: Capítulo Atual */}
            <article className="p-3.5 bg-[#050912]/85 border border-[#d8aa5c]/30 rounded-xl backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#d8aa5c]/60 transition-all">
              <div className="flex items-center gap-1.5 text-[#d8aa5c] text-[10px] tracking-[0.22em] uppercase font-bold mb-1.5">
                <span>✦</span> <span>Capítulo atual</span>
              </div>
              
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="w-8 h-8 rounded-full border border-[#d8aa5c]/60 bg-[#08101a] flex items-center justify-center text-[13px] font-bold font-serif text-[#dfb15b] flex-shrink-0 shadow-[0_0_12px_rgba(216,170,92,0.35)]">
                  {currentChapter.chapterNumber}
                </div>
                <div>
                  <h2 className="font-display text-[13px] font-bold text-white tracking-wide leading-tight line-clamp-1">
                    {currentChapter.title}
                  </h2>
                  <p className="text-[10.5px] text-[#8e887d] font-mono mt-0.5">Parte {currentChapter.arcNumber || 1}</p>
                  <div className="w-10 h-[2px] bg-[#d8aa5c] mt-1 rounded-full" />
                </div>
              </div>

              <Link 
                href={`/chapters/${currentChapter.slug}`}
                className="flex items-center justify-center gap-1.5 border border-[#d8aa5c]/35 hover:border-[#d8aa5c] rounded-lg py-1.5 text-[10.5px] uppercase tracking-wider font-bold text-[#d8aa5c] hover:bg-[#d8aa5c] hover:text-black transition-all mt-2.5 bg-black/40 shadow-sm"
              >
                <span>Continuar lendo</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </article>

            {/* Card 2: Citação Literária */}
            <blockquote className="p-3 bg-[#050912]/85 border border-[#d8aa5c]/25 rounded-xl backdrop-blur-xl text-center text-[11.5px] text-[#cfc9b8] italic font-serif leading-relaxed shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p>“Todo poder tem um preço.<br />Toda escolha, uma consequência.<br />E toda lenda... um começo.”</p>
              <div className="text-[#d8aa5c] text-[9px] mt-1 select-none font-sans">✦</div>
            </blockquote>
          </div>
        </div>

        {/* ─── ZONE 2: LOWER HUD DOCK (Pushed down comfortably towards screen bottom) ─── */}
        <div className="relative z-20 max-w-[1920px] mx-auto w-full px-6 sm:px-8 lg:px-10 pt-4 pb-3 grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-3.5 mt-auto">

          {/* LEFT col (8 cols): Últimos Capítulos (4 cards) + O Mundo */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">

            {/* Últimos Capítulos (4 cards proporcionais) */}
            <div id="chapters">
              <div className="flex items-center justify-between pb-1 mb-1.5 select-none">
                <h2 className="font-display text-[12.5px] tracking-[0.2em] font-bold text-[#fef5e0] uppercase flex items-center gap-1.5 drop-shadow">
                  <span className="text-[#d8aa5c]">✦</span> Últimos Capítulos
                </h2>
                <Link href="/chapters" className="text-[10.5px] uppercase tracking-widest font-sans font-bold text-[#a39c8f] hover:text-[#dfb15b] transition-colors">
                  Ver todos
                </Link>
              </div>

              {chaptersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#050912]/90 border border-[#d8aa5c]/20 rounded-xl h-[112px] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {latestChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/chapters/${chapter.slug}`}
                      className="group relative flex flex-col justify-between h-[112px] rounded-xl border border-[#d8aa5c]/25 overflow-hidden p-2.5 hover:border-[#d8aa5c] hover:shadow-[0_0_20px_rgba(216,170,92,0.35)] transition-all duration-300 bg-[#040810]/95 backdrop-blur-xl shadow-[0_10px_24px_rgba(0,0,0,0.85)] cursor-pointer"
                    >
                      {/* Background Artwork */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108 opacity-80"
                        style={{ backgroundImage: `url('${chapter.imageUrl || "/uploads/hero-arcane-eclipse.png"}')` }} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-[#040810]/75 via-45% to-transparent z-10" />

                      {/* Top Badge */}
                      <div className="relative z-20">
                        <div className="w-5 h-5 rounded-full border border-[#d8aa5c]/60 bg-[#09101a]/90 flex items-center justify-center text-[9.5px] font-bold text-[#dfb15b] shadow-[0_0_8px_rgba(216,170,92,0.3)]">
                          {chapter.chapterNumber}
                        </div>
                      </div>

                      {/* Bottom Title & Metadata */}
                      <div className="relative z-20 select-none">
                        <h3 className="font-display text-[12.5px] font-bold text-white leading-tight group-hover:text-[#dfb15b] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] line-clamp-1">
                          {chapter.title}
                        </h3>
                        <p className="text-[9.5px] text-[#8e887d] font-mono mt-0.5 uppercase tracking-wider">
                          Parte {chapter.arcNumber || 1} • 1 dia atrás
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* O Mundo (UMBRA) - Encaixe perfeito e imponente */}
            <div id="world-panoramic">
              <div className="flex items-center justify-between pb-1 mb-1.5 select-none">
                <h2 className="font-display text-[12.5px] tracking-[0.2em] font-bold text-[#fef5e0] uppercase flex items-center gap-1.5 drop-shadow">
                  <span className="text-[#d8aa5c]">✦</span> O Mundo
                </h2>
                <div className="flex items-center gap-1 text-[#8e887d]">
                  <ChevronLeft className="h-3 w-3 cursor-pointer hover:text-white" />
                  <ChevronRight className="h-3 w-3 cursor-pointer hover:text-white" />
                </div>
              </div>

              <div className="group relative w-full h-[165px] sm:h-[175px] rounded-xl border border-[#d8aa5c]/30 overflow-hidden p-4 flex flex-col justify-end hover:shadow-[0_0_24px_rgba(216,170,92,0.35)] hover:border-[#d8aa5c] transition-all duration-300 bg-[#040810]/95 backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-[1.02] opacity-90 contrast-[1.12] brightness-[1.02]" 
                  style={{ backgroundImage: `url('/front-ed-assets/imagem_umbra_mapa_fantasia.png')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#040810] via-[#040810]/65 via-35% to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040810]/90 via-transparent to-transparent z-10" />
                
                <div className="relative z-20 select-none max-w-md">
                  <span className="text-[10px] tracking-[0.28em] font-sans font-bold text-[#d8aa5c] uppercase leading-none mb-0.5 block drop-shadow">
                    Terras Sombrias
                  </span>
                  <h3 className="font-display text-[24px] sm:text-[26px] font-extrabold text-white uppercase tracking-wider leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    UMBRA
                  </h3>
                  <p className="text-[12.5px] text-[#cfc9b8] mt-1 mb-2.5 leading-snug font-medium drop-shadow line-clamp-1">
                    Terras envoltas por névoa e mistérios antigos.
                  </p>
                  <Link href="/mundo">
                    <button className="border border-[#d8aa5c]/45 hover:border-[#d8aa5c] text-[#e8c87b] text-[10.5px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-[#060c14]/90 hover:bg-[#d8aa5c] hover:text-black transition-all shadow-[0_4px_12px_rgba(0,0,0,0.7)] cursor-pointer flex items-center gap-1.5 group/btn">
                      <span>Explorar mapa</span>
                      <ArrowRight className="h-2.5 w-2.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT col (4 cols): Explorar + Últimas do Diário */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">

            {/* Explorar (4 Quadrantes com Ícones Oficiais) */}
            <div id="explore">
              <div className="pb-1 mb-1.5 select-none">
                <h2 className="font-display text-[12.5px] tracking-[0.2em] font-bold text-[#fef5e0] uppercase flex items-center gap-1.5 drop-shadow">
                  <span className="text-[#d8aa5c]">✦</span> Explorar
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { href: "/characters", src: "/front-ed-assets/icone_personagens.png", label: "Personagens" },
                  { href: "/mundo", src: "/front-ed-assets/icone_mundo_globo.png", label: "Mapa do Mundo" },
                  { href: "/codex", src: "/front-ed-assets/icone_codex_livro.png", label: "Códex" },
                  { href: "/codex", src: "/front-ed-assets/icone_criaturas_dragao.png", label: "Criaturas" },
                ].map(({ href, src, label }) => (
                  <Link 
                    key={label} 
                    href={href} 
                    className="group relative flex flex-col items-center justify-center h-[88px] p-1.5 bg-[#050912]/90 backdrop-blur-xl border border-[#d8aa5c]/25 rounded-xl hover:border-[#d8aa5c] hover:shadow-[0_0_18px_rgba(216,170,92,0.35)] hover:bg-[#09121f] transition-all duration-300 overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.85)] cursor-pointer"
                  >
                    <img
                      src={src}
                      alt=""
                      aria-hidden
                      className="relative z-10 h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-[0_0_10px_rgba(216,170,92,0.4)] transition-all duration-300 group-hover:scale-110"
                    />
                    <span className="relative z-10 text-[9px] font-sans font-bold tracking-[0.15em] text-[#a39c8f] uppercase text-center mt-1 group-hover:text-[#dfb15b] transition-colors line-clamp-1">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Últimas do Diário */}
            <div id="latest-diary">
              <div className="flex items-center justify-between pb-1 mb-1.5 select-none">
                <h2 className="font-display text-[12.5px] tracking-[0.2em] font-bold text-[#fef5e0] uppercase flex items-center gap-1.5 drop-shadow">
                  <span className="text-[#d8aa5c]">✦</span> Últimas do Diário
                </h2>
                <Link href="/blog" className="text-[10.5px] uppercase tracking-widest font-sans font-bold text-[#a39c8f] hover:text-[#dfb15b] transition-colors">
                  Ver todas
                </Link>
              </div>

              {blogLoading ? (
                <div className="bg-[#050912]/90 border border-[#d8aa5c]/20 rounded-xl h-[88px] animate-pulse" />
              ) : (
                <Link
                  href="/blog"
                  className="group p-3 rounded-xl bg-[#050912]/95 border border-[#d8aa5c]/30 hover:border-[#d8aa5c] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(216,170,92,0.2)] backdrop-blur-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-300 select-none hover:shadow-[0_0_20px_rgba(216,170,92,0.3)] h-[88px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border border-[#d8aa5c]/50 bg-[#08101a] flex items-center justify-center text-[#d8aa5c] flex-shrink-0 shadow-[0_0_10px_rgba(216,170,92,0.35)] group-hover:scale-108 transition-transform">
                      <Compass className="h-4 w-4 text-[#d8aa5c]" />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-display font-bold text-white group-hover:text-[#dfb15b] transition-colors line-clamp-1 leading-tight">
                        Nova entrada no diário do autor.
                      </h3>
                      <p className="text-[11px] text-[#8e887d] line-clamp-1 mt-0.5 font-serif italic">
                        Revelações sobre a origem dos selos arcanos.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#d8aa5c] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ─── BANNER CITAÇÃO DE RODAPÉ ─── */}
        <div className="w-full text-center py-2 select-none border-t border-[#d8aa5c]/15 mt-2">
          <p className="text-[10px] tracking-[0.25em] font-serif uppercase text-[#d8aa5c]">
            ✦ “A HISTÓRIA NÃO ESTÁ ESCRITA, ELA ESTÁ SENDO LEMBRADA.” ✦
          </p>
        </div>
      </div>

      {/* ─── FOOTER TRADICIONAL (Abaixo da dobra) ─── */}
      <Footer />
    </div>
  );
}
