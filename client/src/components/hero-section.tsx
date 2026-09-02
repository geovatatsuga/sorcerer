import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroParticles from "@/components/hero-particles";
import Starfield from "@/components/starfield";

const FALLBACK_HERO_IMAGE = "/uploads/hero-arcane-eclipse.png";
const ROTATION_INTERVAL_MS = 9000;

function shuffleImages(images: string[]) {
  return [...images].sort(() => Math.random() - 0.5);
}

export default function HeroSection() {
  const { t } = useLanguage();
  const titleParts = t.heroTitle.split(" ");
  const titleLead = titleParts.slice(0, -2).join(" ");
  const titleAccent = titleParts.slice(-2).join(" ");
  const [heroImages, setHeroImages] = useState<string[]>([FALLBACK_HERO_IMAGE]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/hero-rotativas", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.statusText)))
      .then((data: { images?: string[] }) => {
        if (cancelled || !Array.isArray(data.images) || data.images.length === 0) return;
        setHeroImages(shuffleImages(data.images));
        setActiveImageIndex(0);
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
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  const visibleHeroImages = useMemo(() => {
    const current = heroImages[activeImageIndex] ?? FALLBACK_HERO_IMAGE;
    const previous = heroImages[(activeImageIndex - 1 + heroImages.length) % heroImages.length] ?? current;
    return { current, previous };
  }, [activeImageIndex, heroImages]);

  return (
    <section id="home" className="sorcerer-hero relative overflow-hidden min-h-[75vh] lg:min-h-[82vh] flex items-center pt-24 pb-28 lg:pt-28 lg:pb-36">
      <img
        key={`previous-${visibleHeroImages.previous}`}
        className="sorcerer-hero-bg sorcerer-hero-bg-previous"
        src={visibleHeroImages.previous}
        alt=""
        aria-hidden
      />
      <img
        key={`current-${visibleHeroImages.current}`}
        className="sorcerer-hero-bg sorcerer-hero-bg-current"
        src={visibleHeroImages.current}
        alt=""
        aria-hidden
      />
      <div className="sorcerer-hero-veil" aria-hidden />
      <div className="sorcerer-hero-bottom-fade absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-10" aria-hidden />
      <div className="sorcerer-hero-sigil sorcerer-hero-sigil-left" aria-hidden />
      <div className="sorcerer-hero-sigil sorcerer-hero-sigil-right" aria-hidden />
      <div className="sorcerer-hero-content relative z-20 mx-auto grid max-w-full gap-8 px-4 sm:px-8 lg:px-16 xl:px-20 lg:grid-cols-[minmax(0,1fr)_20rem] w-full">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span />
            A lenda recomeça
          </div>
          <h1 className="hero-title font-display">
            {titleLead}
            <span>{titleAccent}</span>
          </h1>
          <p className="hero-subtitle">
            Magia antiga desperta. Reinos esquecidos tremem. Sua lenda está prestes a ser escrita.
          </p>

          <div className="hero-actions">
            <Button
              asChild
              className="hero-primary-action btn-font"
              data-testid="button-start-reading"
            >
              <Link href="/chapters">
                <Sparkles className="h-4 w-4" />
                {t.startReading || "Começar a ler"}
              </Link>
            </Button>

            <Button
              asChild
              className="hero-secondary-action btn-font"
              data-testid="button-explore-world"
            >
              <Link href="/mundo">
                <Compass className="h-4 w-4" />
                {t.exploreWorld || "Explorar o mundo"}
              </Link>
            </Button>
          </div>

          <div className="hero-progress-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="hero-side-stack">
          <article className="hero-current-panel">
            <div className="hero-panel-label">
              <Sparkles className="h-4 w-4" />
              Capítulo atual
            </div>
            <div className="hero-current-body">
              <div className="hero-chapter-badge">46</div>
              <div>
                <h2>Ecos do Passado</h2>
                <p>Parte 2</p>
                <div className="hero-read-meter"><span /></div>
              </div>
            </div>
            <Link className="hero-panel-button" href="/chapters">
              Continuar lendo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <blockquote className="hero-quote-panel">
            <p>Todo poder tem um preço.<br />Toda escolha, uma consequência.<br />E toda lenda... um começo.</p>
            <span />
          </blockquote>
        </div>
      </div>

      <HeroParticles />
      <Starfield count={36} />

      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 floating">
        <ChevronDown className="text-primary text-2xl h-8 w-8" />
      </div>
    </section>
  );
}
