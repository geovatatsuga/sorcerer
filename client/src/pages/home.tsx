import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import ChapterCard from "@/components/chapter-card";
import CharacterCard from "@/components/character-card";
import WorldMap from "@/components/world-map";
import NewsletterSignup from "@/components/newsletter-signup";
import Footer from "@/components/footer";
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
      <section id="chapters" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-latest-chapters">
              {t.latestChapters || 'Últimos Capítulos'}
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
              {latestChapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/chapters">
              <Button className="bg-secondary text-secondary-foreground px-8 py-3 font-semibold hover-glow" data-testid="button-view-all-chapters">
                  {t.viewAllChapters || 'Ver todos os capítulos'}
                </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Characters Gallery */}
      <section id="characters" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-characters">
              {t.characters || 'Personagens'}
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
              {mainCharacters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/characters">
              <Button 
                variant="outline"
                className="border-border text-foreground px-8 py-3 font-semibold hover:bg-muted transition-colors"
                data-testid="button-view-character-profiles"
              >
                {t.viewCharacterProfiles || 'Ver perfis de personagens'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Interactive World Map */}
      <section id="world" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-explore-realms">
              {t.exploreRealms || 'Explore os Reinos'}
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
        </div>
      </section>
      
      {/* Codex Section */}
      <section id="codex" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-codex">
              {t.theCodex || 'O Códex'}
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.comprehensiveGuide || 'Um guia completo sobre magia, criaturas e locais.'}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Magic Systems */}
            <Card className="bg-card border border-border rounded-lg p-8 hover-glow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="text-primary text-2xl h-8 w-8" />
                </div>
                  <h3 className="font-display text-xl font-semibold text-card-foreground" data-testid="text-magic-systems">
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
            <Card className="bg-card border border-border rounded-lg p-8 hover-glow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="text-primary text-2xl h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold text-card-foreground" data-testid="text-creatures-beasts">
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
            <Card className="bg-card border border-border rounded-lg p-8 hover-glow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-primary text-2xl h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold text-card-foreground" data-testid="text-legendary-locations">
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
      </section>
      
      {/* Blog Section */}
      <section id="blog" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4" data-testid="text-authors-chronicles">
              {t.authorsChronicles}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.behindScenesInsights}
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
                {recentBlogPosts.map((post) => (
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
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      <NewsletterSignup />
      <Footer />
    </div>
  );
}
