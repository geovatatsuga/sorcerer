import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ChapterCard from "@/components/chapter-card";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Chapter } from "@shared/schema";

export default function Chapters() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4" data-testid="text-chapters-title">
              All Chapters
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Dive into the complete collection of chapters in The Return of the First Sorcerer
            </p>
            
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                data-testid="input-search-chapters"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-4" data-testid="text-no-chapters">
                {searchQuery ? "No chapters found" : "No chapters available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "New chapters will appear here as they are published"
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredChapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
