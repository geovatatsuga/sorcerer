import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import Reveal from "@/components/reveal";
import ChapterCard from "@/components/chapter-card";
import CharacterCard from "@/components/character-card";
import WorldMap from "@/components/world-map";
import SectionDivider from "@/components/section-divider";
import SectionIcon from "@/components/section-icon";
import NewsletterSignup from "@/components/newsletter-signup";
import Footer from "@/components/footer";
import HeroParticles from "@/components/hero-particles";
import Starfield from "@/components/starfield";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Crown, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Chapter, Character, Location, BlogPost } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const localized = (item: any, field: string) => {
    return item[field] || '';
  };

  const latestChapters = chapters.slice(0, 3);
  const mainCharacters = characters.slice(0, 4);
  const featuredBlogPost = blogPosts[0];
  const recentBlogPosts = blogPosts.slice(1, 4);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      
  {/* Latest Chapters */}
  <Reveal className="w-full">
  <section id="chapters" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center justify-center min-h-32">
            <h2 className="section-title font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-latest-chapters">
              <SectionIcon type="rune" />{t.latestChapters || 'Últimos Capítulos'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.followEpicJourney || 'Acompanhe a jornada épica em cada capítulo.'}
            </p>
          </div>

          {chaptersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestChapters.map((chapter, idx) => (
                <Reveal key={chapter.id} delay={idx * 80} className="">
                  <ChapterCard key={chapter.id} chapter={chapter} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="text-center mt-12 flex flex-col items-center justify-center min-h-32">
            <Link href="/chapters">
              <Button className="btn-gold btn-font px-8 py-3 font-semibold hover-glow btn-micro" data-testid="button-view-all-chapters">
                  {t.viewAllChapters || 'Ver todos os capítulos'}
                </Button>
            </Link>
          </div>
        </div>
    </section>
      
  <SectionDivider />

  {/* Characters Gallery */}
  </Reveal>

  <Reveal className="w-full">
  <section id="characters" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mt-12 mb-12">
            <h2 className="section-title font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-characters">
              <SectionIcon type="leaf" />{t.characters || 'Personagens'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.meetHeroesVillains || 'Conheça heróis, vilões e rostos memoráveis do reino.'}
            </p>
        </div>
          
          {charactersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mainCharacters.map((character, idx) => (
                <Reveal key={character.id} delay={idx * 80} className="">
                  <CharacterCard key={character.id} character={character} />
                </Reveal>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/characters">
              <Button 
                className="btn-gold btn-font px-8 py-3 font-semibold hover-glow btn-micro"
                data-testid="button-view-character-profiles"
              >
                {t.viewCharacterProfiles || 'Ver perfis de personagens'}
              </Button>
            </Link>
          </div>
    </div>
  </section>
  </Reveal>
  <SectionDivider />

  {/* Interactive World Map */}
  <Reveal className="w-full">
  <section id="world" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center justify-center min-h-32">
            <h2 className="section-title font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-explore-realms">
              <SectionIcon type="spark" />{t.exploreRealms || 'Explore os Reinos'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.discoverVastWorld || 'Descubra o vasto mundo, locais e segredos ocultos.'}
            </p>
          </div>
          
          {locationsLoading ? (
            <div className="bg-card border border-border rounded-xl h-96 animate-pulse" />
          ) : (
            <WorldMap locations={locations} />
          )}
          <div className="text-center mt-12">
            <Link href="/world">
              <Button className="btn-gold btn-font px-8 py-3 font-semibold hover-glow btn-micro" data-testid="button-world">
                Explore as Localizações
              </Button>
            </Link>
          </div>
        </div>
  </section>
  </Reveal>
      
  {/* Codex Section */}
  <Reveal className="w-full">
  <section id="codex" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto codex-wrapper">
          <div className="codex-bg">
            {/* Poster fallback image behind the video (shows if video doesn't load) */}
            <img src="/uploads/nOVOCOVER-poster.jpg" alt="" className="codex-bg-poster" />
            <video autoPlay muted loop playsInline preload="auto" className="hero-like-video" aria-hidden>
              <source src="/uploads/nOVOCOVER.webm" type="video/webm" />
              <source src="/uploads/nOVOCOVER.mp4" type="video/mp4" />
            </video>
            {/* Full-bleed dark overlay (same pattern as HeroSection) */}
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.70)', zIndex: 2 }} aria-hidden />
            {/* Hero-like decorative layers copied from HeroSection: place inside codex-bg so they align to the video box */}
            <HeroParticles />
            <Starfield count={36} />
          </div>
      <div className="codex-content relative z-10">
            <div className="text-center mb-16 flex flex-col items-center justify-center min-h-32">
        <h2 className="section-title font-display text-3xl md:text-4xl font-bold text-primary text-shadow-gold mb-4" data-testid="text-codex">
                {t.theCodex || 'O Códex'}
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.comprehensiveGuide || 'Um guia completo sobre magia, criaturas e locais.'}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
            {/* Magic Systems */}
            <Card className="bg-card border border-border rounded-lg p-6 hover-glow codex-card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="text-primary text-2xl h-8 w-8" />
                </div>
                  <h3 className="font-display text-lg font-semibold text-card-foreground" data-testid="text-magic-systems">
                    {t.magicSystems || 'Sistemas Mágicos'}
                  </h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.elementalMagic || 'Magia Elemental'}</h4>
                    <p className="text-muted-foreground text-sm">{t.elementalMagicDesc || 'Controle sobre fogo, água, terra e ar.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.shadowWeaving || 'Tecelagem das Sombras'}</h4>
                  <p className="text-muted-foreground text-sm">{t.shadowWeavingDesc || 'Manipulação da escuridão e da energia do vazio.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.divineChanneling || 'Canalização Divina'}</h4>
                  <p className="text-muted-foreground text-sm">{t.divineChannelingDesc || 'Extrair poder de seres celestiais.'}</p>
                </div>
              </div>
            </Card>
            
            {/* Creatures */}
            <Card className="bg-card border border-border rounded-lg p-6 hover-glow codex-card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="text-primary text-2xl h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground" data-testid="text-creatures-beasts">
                  {t.creaturesBeasts || 'Criaturas e Bestas'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.skyfireDragons || 'Dragões de Fogo Celeste'}</h4>
                  <p className="text-muted-foreground text-sm">{t.skyfireDragonsDesc || 'Antigos guardiões dos cumes montanhosos.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.shadowWraiths || 'Espectros das Sombras'}</h4>
                  <p className="text-muted-foreground text-sm">{t.shadowWraithsDesc || 'Almas corrompidas vinculadas à escuridão.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.crystalSprites || 'Sprites de Cristal'}</h4>
                  <p className="text-muted-foreground text-sm">{t.crystalSpritesDesc || 'Seres benevolentes de pura energia mágica.'}</p>
                </div>
              </div>
            </Card>
            
            {/* Locations */}
            <Card className="bg-card border border-border rounded-lg p-6 hover-glow codex-card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-primary text-2xl h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground" data-testid="text-legendary-locations">
                  {t.legendaryLocations || 'Locais Lendários'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.sunspireTower || 'Torre Sunspire'}</h4>
                  <p className="text-muted-foreground text-sm">{t.sunspireTowerDesc || 'A maior academia mágica, flutuando acima das nuvens.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.nethermoorCaverns || 'Cavernas de Nethermoor'}</h4>
                  <p className="text-muted-foreground text-sm">{t.nethermoorCavernsDesc || 'Túneis subterrâneos repletos de magia sombria.'}</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <h4 className="font-semibold text-card-foreground">{t.eternalForge || 'Forja Eterna'}</h4>
                  <p className="text-muted-foreground text-sm">{t.eternalForgeDesc || 'Onde armas lendárias são forjadas.'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        {/* CTA overlay - positioned over the video */}
        <div className="codex-cta-over" aria-hidden={false}>
          <Link href="/codex">
            <Button className="btn-gold btn-font px-12 py-4 text-lg font-semibold hover-glow" data-testid="button-codex">
              {t.theCodex || 'Ver o Códex'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </Reveal>
      
  {/* Blog Section */}
  <Reveal className="w-full">
  <section id="blog" className="py-20 px-4 mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center justify-center min-h-32">
            <h2 className="section-title font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-authors-chronicles">
              {t.authorsChronicles || 'Crônicas do Autor'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.behindScenesInsights || 'Bastidores e insights do autor'}
            </p>
          </div>
          
          {blogLoading ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-lg h-96 animate-pulse" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-lg h-32 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Featured Blog Post */}
              {featuredBlogPost && (
                <Card className="bg-card border border-border rounded-lg overflow-hidden hover-glow">
                  {featuredBlogPost.imageUrl && (
                    <img 
                      src={featuredBlogPost.imageUrl} 
                      alt={featuredBlogPost.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium">
                        {featuredBlogPost.category}
                      </span>
                      <span className="text-muted-foreground text-sm ml-4">
                        {timeAgo(featuredBlogPost.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-card-foreground mb-3" data-testid={`text-blog-title-${featuredBlogPost.id}`}>
                      {featuredBlogPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid={`text-blog-excerpt-${featuredBlogPost.id}`}>
                      {featuredBlogPost.excerpt}
                    </p>
                    <Button 
                      variant="ghost"
                      className="text-primary hover:text-accent transition-colors font-medium p-0"
                      data-testid={`button-read-blog-${featuredBlogPost.id}`}
                    >
                      {t.readMore} →
                    </Button>
                  </CardContent>
                </Card>
              )}

            
              {/* Blog Posts List */}
              <div className="space-y-6">
                {recentBlogPosts.map((post, idx) => (
                  <Reveal key={post.id} delay={idx * 80} className="">
                    <Card key={post.id} className="bg-card border border-border rounded-lg p-6 hover-glow">
                      <div className="flex items-center mb-2">
                        <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                          {post.category}
                        </span>
                        <span className="text-muted-foreground text-sm ml-3">
                          {timeAgo(post.publishedAt)}
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-semibold text-card-foreground mb-2" data-testid={`text-blog-title-${post.id}`}>
                        {post.title}
                      </h4>
                      <p className="text-muted-foreground text-sm" data-testid={`text-blog-excerpt-${post.id}`}>
                        {post.excerpt}
                      </p>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
  </section>
  </Reveal>
  {/* Blog CTA (moved under the two blog cards) */}
  <div className="max-w-7xl mx-auto text-center mt-8">
    <Link href="/blog">
      <Button className="btn-gold btn-font px-8 py-3 font-semibold hover-glow btn-micro" data-testid="button-chronicles">
        {t.processCreation || 'Processo de criação'}
      </Button>
    </Link>
  </div>
      
      <NewsletterSignup />
      <Footer />
    </div>
  );
}
