import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background video (optimized: WebM first, MP4 fallback). Poster + preload none to improve LCP */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/uploads/tensorpix-poster.jpg"
        aria-hidden
      >
        <source src="/uploads/tensorpix-1280.webm" type="video/webm" />
        <source src="/uploads/tensorpix-1280.mp4" type="video/mp4" />
        {/* fallback text */}
      </video>

  {/* Dark overlay so the title remains readable (increased by ~15% overall) */}
    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary text-shadow-gold mb-6">
          {t.heroTitle.split(' ').slice(0, -2).join(' ')}<br />
          <span className="text-accent">{t.heroTitle.split(' ').slice(-2).join(' ')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          {t.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 font-semibold shadow hover-glow"
            data-testid="button-start-reading"
          >
            <Link href="/chapters">{t.startReading || 'Começar a ler'}</Link>
          </Button>

          <Button
            asChild
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 font-semibold transition-colors"
            data-testid="button-explore-world"
          >
            <Link href="/world">{t.exploreWorld || 'Explorar o mundo'}</Link>
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 floating">
        <ChevronDown className="text-primary text-2xl h-8 w-8" />
      </div>
    </section>
  );
}
