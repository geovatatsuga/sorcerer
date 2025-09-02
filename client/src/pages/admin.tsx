import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Book, 
  Users, 
  MapPin, 
  Scroll, 
  FileText,
  AlertCircle,
  Lock
} from "lucide-react";
import type { 
  Chapter, InsertChapter,
  Character, InsertCharacter, 
  Location, InsertLocation,
  CodexEntry, InsertCodexEntry,
  BlogPost, InsertBlogPost,
  User
} from "@shared/schema";

export default function AdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chapters");

  // Check if user is authenticated and is admin
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="p-8">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Login Necessário</h1>
              <p className="text-muted-foreground mb-6">
                Você precisa estar logado para acessar o painel de administração.
              </p>
              <Button asChild>
                <a href="/api/login">Entrar</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="p-8">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-6">
                Você não tem permissões de administrador para acessar esta página.
              </p>
              <Button variant="outline" asChild>
                <a href="/">Voltar ao Início</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie capítulos, personagens, localizações, codex e posts do blog
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Capítulos
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personagens
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localizações
            </TabsTrigger>
            <TabsTrigger value="codex" className="flex items-center gap-2">
              <Scroll className="h-4 w-4" />
              Codex
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters">
            <ChapterManager />
          </TabsContent>
          
          <TabsContent value="characters">
            <CharacterManager />
          </TabsContent>
          
          <TabsContent value="locations">
            <LocationManager />
          </TabsContent>
          
          <TabsContent value="codex">
            <CodexManager />
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}

// Individual manager components
function ChapterManager() {
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  if (isLoading) {
    return <div>Carregando capítulos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Capítulos</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Capítulo
        </Button>
      </div>
      
      <div className="grid gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{chapter.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Capítulo {chapter.chapterNumber} • {chapter.readingTime} min
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {chapter.excerpt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CharacterManager() {
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });

  if (isLoading) {
    return <div>Carregando personagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Personagens</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Personagem
        </Button>
      </div>
      
      <div className="grid gap-4">
        {characters.map((character) => (
          <Card key={character.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {character.imageUrl && (
                    <img 
                      src={character.imageUrl} 
                      alt={character.name}
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{character.name}</h3>
                    <p className="text-sm text-primary">{character.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {character.description}
                    </p>
                    <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                      {character.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LocationManager() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  if (isLoading) {
    return <div>Carregando localizações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Localizações</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Localização
        </Button>
      </div>
      
      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {location.description}
                  </p>
                  <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                    {location.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CodexManager() {
  const { data: entries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ['/api/codex'],
  });

  if (isLoading) {
    return <div>Carregando entradas do codex...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Codex</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {entry.description}
                  </p>
                  <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                    {entry.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BlogManager() {
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  if (isLoading) {
    return <div>Carregando posts do blog...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Blog</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Post
        </Button>
      </div>
      
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.excerpt}
                    </p>
                    <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}