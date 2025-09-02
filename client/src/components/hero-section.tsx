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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      <div className="absolute inset-0 magical-gradient opacity-80" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary text-shadow-gold mb-6">
          {t.heroTitle.split(' ').slice(0, -2).join(' ')}<br />
          <span className="text-accent">{t.heroTitle.split(' ').slice(-2).join(' ')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          {t.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chapters">
            <Button 
              className="bg-primary text-primary-foreground px-8 py-3 font-semibold hover-glow"
              data-testid="button-start-reading"
            >
              {t.startReading}
            </Button>
          </Link>
          <Link href="/world">
            <Button 
              variant="outline"
              className="border-border text-foreground px-8 py-3 font-semibold hover:bg-muted transition-colors"
              data-testid="button-explore-world"
            >
              {t.exploreWorld}
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 floating">
        <ChevronDown className="text-primary text-2xl h-8 w-8" />
      </div>
    </section>
  );
}
