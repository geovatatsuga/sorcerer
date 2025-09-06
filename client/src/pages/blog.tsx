import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { BlogPost } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // useLanguage provides translations and current language
  
  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const { language, t } = useLanguage();

  const categories = ["all", "update", "worldBuilding", "behindScenes", "research"];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
  if (diffDays === 1) return t.oneDayAgo || '1 day ago';
  if (diffDays < 7) return `${diffDays} ${t.daysAgo}`;
  if (diffDays < 14) return t.oneWeekAgo || '1 week ago';
  if (diffDays < 21) return t.twoWeeksAgo || '2 weeks ago';
  return t.threeWeeksAgo || '3 weeks ago';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "update":
        return "bg-primary/20 text-primary";
      case "world-building":
        return "bg-accent/20 text-accent";
      case "behind-scenes":
        return "bg-secondary/20 text-secondary-foreground";
      case "research":
        return "bg-muted/20 text-muted-foreground";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4" data-testid="text-blog-title">
              {t.blogTitle}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              {t.blogDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-3xl mx-auto">
                <Input
                type="text"
                placeholder={t.searchBlog}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                data-testid="input-search-blog"
              />
              
              <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                    data-testid={`button-filter-${category}`}
                  >
          {category === 'all' ? t.all : category === 'behind-scenes' ? t.behindScenes || 'Behind Scenes' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl font-semibold text-muted-foreground mb-4" data-testid="text-no-blog-posts">
                {searchQuery || selectedCategory !== 'all' ? t.noBlogPostsFound : t.noBlogPosts}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' ? t.adjustFilters : t.blogWillAppear}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-card border border-border rounded-lg overflow-hidden hover-glow cursor-pointer transition-transform hover:scale-105">
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-6" onClick={() => window.location.href = `/blog/${post.slug}`}>
                    <div className="flex items-center mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                        {post.category === "behind-scenes" ? "Behind Scenes" : post.category}
                      </span>
                      <span className="text-muted-foreground text-sm ml-4" data-testid={`text-blog-date-${post.id}`}>
                        {timeAgo(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-card-foreground mb-3" data-testid={`text-blog-title-${post.id}`}>
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid={`text-blog-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                    <Button 
                      variant="ghost"
                      className="text-primary hover:text-accent transition-colors font-medium p-0"
                      data-testid={`button-read-blog-${post.id}`}
                    >
                      Read More →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


