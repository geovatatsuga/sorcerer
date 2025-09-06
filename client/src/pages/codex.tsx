import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Crown, MapPin } from "lucide-react";
import { Link } from 'wouter';
import { useState } from "react";
import type { CodexEntry } from "@shared/schema";
// translations removed — use primary fields only
import { useLanguage } from '@/contexts/LanguageContext';

export default function Codex() {
  const [selectedCategory, setSelectedCategory] = useState("magic");
  
  const { data: codexEntries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ['/api/codex'],
  });

  const categorizedEntries = {
    magic: codexEntries.filter(entry => entry.category === "magic"),
    creatures: codexEntries.filter(entry => entry.category === "creatures"),
  locations: codexEntries.filter(entry => entry.category === "locations"),
  items: codexEntries.filter(entry => entry.category === "items"),
  other: codexEntries.filter(entry => entry.category === "other"),
  };

  // single-language app: use t from LanguageContext if available elsewhere; no language switching here
  const { t } = useLanguage();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "magic":
        return <Wand2 className="h-5 w-5" />;
      case "creatures":
        return <Crown className="h-5 w-5" />;
      case "locations":
        return <MapPin className="h-5 w-5" />;
      case "items":
        return <Wand2 className="h-5 w-5" />;
      case "other":
        return <Wand2 className="h-5 w-5" />;
      default:
        return <Wand2 className="h-5 w-5" />;
    }
  };

  // Fallback content when no entries exist
  const fallbackContent = {
    magic: [
      { title: "Elemental Magic", description: "Control over fire, water, earth, and air through ancient incantations" },
      { title: "Shadow Weaving", description: "Manipulation of darkness and void energy, forbidden in most kingdoms" },
      { title: "Divine Channeling", description: "Drawing power from celestial beings and ancient gods" },
      { title: "Rune Crafting", description: "Inscribing magical symbols to store and release power" },
    ],
    creatures: [
      { title: "Skyfire Dragons", description: "Ancient guardians of the mountain peaks, masters of elemental fire" },
      { title: "Shadow Wraiths", description: "Corrupted souls bound to darkness, seeking to drain life force" },
      { title: "Crystal Sprites", description: "Benevolent beings of pure magical energy that inhabit crystal caves" },
      { title: "Void Stalkers", description: "Predators from between dimensions that hunt magical beings" },
    ],
    locations: [
      { title: "The Sunspire Tower", description: "The highest magical academy in the realm, floating above the clouds" },
      { title: "Nethermoor Caverns", description: "Underground network of ancient tunnels filled with dark magic" },
      { title: "The Eternal Forge", description: "Where legendary weapons are crafted using starfire and dragon breath" },
      { title: "Whispering Woods", description: "A mystical forest where the trees themselves hold ancient memories" },
    ],
    items: [
      { title: "Ancient Relic", description: "A mysterious artifact imbued with lost magic." },
      { title: "Enchanted Blade", description: "A sword forged with runes to slay otherworldly beings." },
      { title: "Potion of Sight", description: "Grants temporary visions of other planes." },
      { title: "Sealing Charm", description: "Used to bind spirits to objects or places." },
    ],
    other: [
      { title: "Legends & Lore", description: "Collected myths and oral histories from across the realm." },
      { title: "Occult Symbols", description: "Catalog of sigils and their meanings." },
      { title: "Lost Tongues", description: "Fragments of ancient languages used in ritual magic." },
      { title: "Curiosities", description: "Miscellaneous oddities that defy easy categorization." },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4" data-testid="text-codex-title">
              {t.codexPageTitle || 'O Códex'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.codexPageDesc || 'Navegue por entradas do lore sobre magia, criaturas e locais.'}
            </p>
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-5 mb-12">
                <TabsTrigger value="magic" className="flex items-center gap-2" data-testid="tab-magic">
                  <Wand2 className="h-4 w-4" />
                  {t.magic || 'Magia'}
                </TabsTrigger>
                <TabsTrigger value="creatures" className="flex items-center gap-2" data-testid="tab-creatures">
                  <Crown className="h-4 w-4" />
                  {t.creatures || 'Criaturas'}
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex items-center gap-2" data-testid="tab-locations">
                  <MapPin className="h-4 w-4" />
                  {t.locations || 'Locais'}
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center gap-2" data-testid="tab-items">
                  <Wand2 className="h-4 w-4" />
                  {'Itens'}
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-2" data-testid="tab-other">
                  <Wand2 className="h-4 w-4" />
                  {'Outros'}
                </TabsTrigger>
              </TabsList>

              {["magic", "creatures", "locations", "items", "other"].map((category) => (
                <TabsContent key={category} value={category}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-card border border-border rounded-lg h-64 animate-pulse" />
                    ))
                  ) : categorizedEntries[category as keyof typeof categorizedEntries].length === 0 ? (
                    // Show fallback content when no entries exist
          fallbackContent[category as keyof typeof fallbackContent].map((item, index) => (
                      <Card key={index} className="bg-card border border-border rounded-lg hover-glow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              {getCategoryIcon(category)}
                            </div>
                              <h3 className="font-display text-lg font-semibold text-card-foreground" data-testid={`text-entry-title-${index}`}>
                              {item.title}
                            </h3>
                          </div>
                              <p className="text-muted-foreground text-sm" data-testid={`text-entry-description-${index}`}>
                            {item.description}
                            </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    categorizedEntries[category as keyof typeof categorizedEntries].map((entry) => (
                      <Card key={entry.id} className="bg-card border border-border rounded-lg hover-glow cursor-pointer transition-transform hover:scale-105">
                        {entry.imageUrl && (
                          <img 
                            src={entry.imageUrl} 
                            alt={entry.title}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                        )}
                        <CardContent className="p-6" onClick={() => (window.location.href = `/codex/${entry.id}`)}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              {getCategoryIcon(category)}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm" data-testid={`text-entry-description-${entry.id}`}>
                            {entry.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


