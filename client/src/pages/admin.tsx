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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
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

type AdminFormPayload = { data: any; translations?: { pt?: any; en?: any; es?: any } };

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
                <a
                  href="/api/login"
                  onClick={(e) => {
                    // Prevent SPA router interception and do a full-page navigation
                    e.preventDefault();
                    window.location.href = '/api/login';
                  }}
                >
                  Entrar
                </a>
              </Button>

              {/* Development helper: allow creating a dev admin and logging in locally */}
              {process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !process.env.REPLIT_DOMAINS && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-muted-foreground">Modo dev: criar um usuário admin local e entrar sem OIDC.</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={async () => {
                      try {
                        const res = await fetch('/api/dev/create-admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Local Admin' }) });
                        const data = await res.json();
                        if (res.ok) {
                          // login as that user
                          await fetch('/api/dev/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: data.user.id }) });
                          // reload to pick up session
                          window.location.reload();
                        } else {
                          alert(data.message || 'Failed to create admin');
                        }
                      } catch (err) {
                        alert('Dev create admin failed');
                      }
                    }}>
                      Criar admin local & Entrar
                    </Button>
                    <Button variant="outline" onClick={async () => {
                      try {
                        // try to login with a default id
                        await fetch('/api/dev/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'dev-admin', isAdmin: true }) });
                        window.location.reload();
                      } catch (err) { alert('Dev login failed'); }
                    }}>
                      Entrar como dev-admin
                    </Button>
                  </div>
                </div>
              )}
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
  const { t } = useLanguage();
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);

  const createChapter = useMutation({
    mutationFn: async (payload: InsertChapter) => {
      const res = await fetch('/api/admin/chapters', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chapters'] })
  });

  const updateChapter = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertChapter> }) => {
      const res = await fetch(`/api/admin/chapters/${id}`, { method: 'PUT', headers: { 'content-type':'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chapters'] })
  });

  if (isLoading) {
    return <div>Carregando capítulos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Capítulos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Capítulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Capítulo' : 'Novo Capítulo'}</DialogTitle>
              <DialogDescription>{t.chapters}</DialogDescription>
            </DialogHeader>
            <ChapterForm
              initial={editing ?? undefined}
              onSubmit={async (payload) => {
                try {
                  if (editing) {
                    await updateChapter.mutateAsync({ id: editing.id, data: payload.data });
                    // save translations
                    if (payload.translations && editing.id) {
                      await fetch(`/api/dev/translations/chapters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'pt', data: payload.translations.pt }) });
                      await fetch(`/api/dev/translations/chapters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'en', data: payload.translations.en }) });
                      await fetch(`/api/dev/translations/chapters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'es', data: payload.translations.es }) });
                    }
                  } else {
                    const res = await createChapter.mutateAsync(payload.data as InsertChapter);
                    const id = res?.id;
                    if (payload.translations && id) {
                      await fetch(`/api/dev/translations/chapters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'pt', data: payload.translations.pt }) });
                      await fetch(`/api/dev/translations/chapters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'en', data: payload.translations.en }) });
                      await fetch(`/api/dev/translations/chapters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'es', data: payload.translations.es }) });
                    }
                  }
                  setOpen(false);
                  setEditing(null);
                } catch (err) { console.error(err); alert('Erro ao salvar capítulo'); }
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <Button variant="outline" size="sm" onClick={() => { setEditing(chapter); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Deletar capítulo?')) return;
                    try { await fetch(`/api/admin/chapters/${chapter.id}`, { method: 'DELETE' }); queryClient.invalidateQueries({ queryKey: ['/api/chapters'] }); }
                    catch (e) { alert('Falha ao deletar'); }
                  }}>
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

function ChapterForm({ initial, onSubmit }: { initial?: Chapter; onSubmit: (payload: AdminFormPayload) => Promise<void> }) {
  // main data (stored in DB)
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [chapterNumber, setChapterNumber] = useState(initial?.chapterNumber ?? 1);
  const [readingTime, setReadingTime] = useState(initial?.readingTime ?? 5);
  const [publishedAt, setPublishedAt] = useState(initial?.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0,16) : new Date().toISOString().slice(0,16));

  // translations: title and excerpt per language
  const [titlePt, setTitlePt] = useState(initial?.title ?? '');
  const [excerptPt, setExcerptPt] = useState(initial?.excerpt ?? '');
  const [titleEn, setTitleEn] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [excerptEs, setExcerptEs] = useState('');
  const { language } = useLanguage();

  const uploadFile = async (file: File) => {
    try {
  const data = await file.arrayBuffer();
  const arr = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i]);
  const base64 = btoa(binary);
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ filename: file.name, data: base64 }) });
      const json = await res.json();
      return json.url as string | undefined;
    } catch (err) { console.error(err); return undefined; }
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault();
      const data: any = { slug, content, chapterNumber, readingTime, publishedAt: new Date(publishedAt) };
      const translations = { pt: { title: titlePt, excerpt: excerptPt }, en: { title: titleEn, excerpt: excerptEn }, es: { title: titleEs, excerpt: excerptEs } };
      await onSubmit({ data, translations } as any);
    }}>
      <div className="grid gap-2">
        <Label>Slug</Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Label>Conteúdo (único)</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Capítulo</Label>
            <Input type="number" value={chapterNumber} onChange={(e) => setChapterNumber(Number(e.target.value))} />
          </div>
          <div>
            <Label>Tempo de leitura (min)</Label>
            <Input type="number" value={readingTime} onChange={(e) => setReadingTime(Number(e.target.value))} />
          </div>
        </div>
        <Label>Publicado em</Label>
        <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        <h4 className="mt-4 font-semibold">Traduções - Português</h4>
        <Label>Título (PT)</Label>
        <Input value={titlePt} onChange={(e) => setTitlePt(e.target.value)} />
        <Label>Resumo (PT)</Label>
        <Textarea value={excerptPt} onChange={(e) => setExcerptPt(e.target.value)} />
        <h4 className="mt-4 font-semibold">Traduções - English</h4>
        <Label>Title (EN)</Label>
        <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        <Label>Excerpt (EN)</Label>
        <Textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} />
  <h4 className="mt-4 font-semibold">Traduções - Español</h4>
  <Label>Título (ES)</Label>
  <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} />
  <Label>Resumen (ES)</Label>
  <Textarea value={excerptEs} onChange={(e) => setExcerptEs(e.target.value)} />
        <div className="flex justify-end mt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </div>
    </form>
  );
}

function CharacterManager() {
  const { t } = useLanguage();
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);

  const createCharacter = useMutation({
    mutationFn: async (payload: InsertCharacter) => {
      const res = await fetch('/api/admin/characters', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/characters'] })
  });

  const updateCharacter = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCharacter> }) => {
      const res = await fetch(`/api/admin/characters/${id}`, { method: 'PUT', headers: { 'content-type':'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/characters'] })
  });

  if (isLoading) {
    return <div>Carregando personagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Personagens</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Personagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Personagem' : 'Novo Personagem'}</DialogTitle>
              <DialogDescription>{t.characters}</DialogDescription>
            </DialogHeader>
            <CharacterForm
              initial={editing ?? undefined}
              onSubmit={async (payload) => {
                try {
                  if (editing) {
                    await updateCharacter.mutateAsync({ id: editing.id, data: payload.data });
                    if (payload.translations && editing.id) {
                      await fetch(`/api/dev/translations/characters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'pt', data: payload.translations.pt }) });
                      await fetch(`/api/dev/translations/characters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'en', data: payload.translations.en }) });
                      await fetch(`/api/dev/translations/characters/${editing.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'es', data: payload.translations.es }) });
                    }
                  } else {
                    const res = await createCharacter.mutateAsync(payload.data as InsertCharacter);
                    const id = res?.id;
                    if (payload.translations && id) {
                      await fetch(`/api/dev/translations/characters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'pt', data: payload.translations.pt }) });
                      await fetch(`/api/dev/translations/characters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'en', data: payload.translations.en }) });
                      await fetch(`/api/dev/translations/characters/${id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: 'es', data: payload.translations.es }) });
                    }
                  }
                  setOpen(false);
                  setEditing(null);
                } catch (err) { console.error(err); alert('Erro ao salvar personagem'); }
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <Button variant="outline" size="sm" onClick={() => { setEditing(character); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Deletar personagem?')) return;
                    try { await fetch(`/api/admin/characters/${character.id}`, { method: 'DELETE' }); queryClient.invalidateQueries({ queryKey: ['/api/characters'] }); }
                    catch (e) { alert('Falha ao deletar'); }
                  }}>
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

function CharacterForm({ initial, onSubmit }: { initial?: Character; onSubmit: (payload: AdminFormPayload) => Promise<void> }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  // description will be the default PT or primary
  const [description, setDescription] = useState(initial?.description ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [role, setRole] = useState(initial?.role ?? 'protagonist');

  // story slots: pt/en/es
  const [storyPt, setStoryPt] = useState('');
  const [storyEn, setStoryEn] = useState('');
  const [storyEs, setStoryEs] = useState('');

  const uploadFile = async (file: File) => {
    try {
  const data = await file.arrayBuffer();
  const arr = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i]);
  const base64 = btoa(binary);
  const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ filename: file.name, data: base64 }) });
      const json = await res.json();
      return json.url as string | undefined;
    } catch (err) { console.error(err); return undefined; }
  };

  // if editing, try to load existing translations into story slots
  useEffect(() => {
    if (!initial?.id) return;
    const id = initial.id;
    (async () => {
      try {
        const resPt = await fetch(`/api/dev/translations/characters/${id}?lang=pt`);
        const jsonPt = await resPt.json();
        if (jsonPt?.translation?.description) setStoryPt(jsonPt.translation.description);
      } catch (e) { /* ignore */ }
    })();
    (async () => {
      try {
        const resEn = await fetch(`/api/dev/translations/characters/${id}?lang=en`);
        const jsonEn = await resEn.json();
        if (jsonEn?.translation?.description) setStoryEn(jsonEn.translation.description);
      } catch (e) { /* ignore */ }
    })();
    (async () => {
      try {
        const resEs = await fetch(`/api/dev/translations/characters/${id}?lang=es`);
        const jsonEs = await resEs.json();
        if (jsonEs?.translation?.description) setStoryEs(jsonEs.translation.description);
      } catch (e) { /* ignore */ }
    })();
  }, [initial?.id]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const data: any = { name, title, description, imageUrl, role };
      const translations = { pt: { description: storyPt }, en: { description: storyEn }, es: { description: storyEs } };
      await onSubmit({ data, translations } as any);
    }}>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Label>Título</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Label>Resumo / Descrição (PT)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <Label>Imagem</Label>
        <div className="flex gap-2">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <input type="file" onChange={async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { const url = await uploadFile(f); if (url) setImageUrl(url); } }} />
        </div>
        <Label>Role</Label>
        <Select>
          <SelectTrigger>
            <SelectValue>{role}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="protagonist">Protagonista</SelectItem>
            <SelectItem value="supporting">Apoio</SelectItem>
            <SelectItem value="antagonist">Antagonista</SelectItem>
          </SelectContent>
        </Select>

        <h4 className="mt-4 font-semibold">História (PT)</h4>
        <Textarea value={storyPt} onChange={(e) => setStoryPt(e.target.value)} />
        <h4 className="mt-2 font-semibold">História (EN)</h4>
        <Textarea value={storyEn} onChange={(e) => setStoryEn(e.target.value)} />
        <h4 className="mt-2 font-semibold">História (ES)</h4>
        <Textarea value={storyEs} onChange={(e) => setStoryEs(e.target.value)} />

        <div className="flex justify-end mt-4">
          <Button type="submit">Salvar</Button>
        </div>
      </div>
    </form>
  );
}

function LocationManager() {
  const { t } = useLanguage();
  const { data: locations = [], isLoading } = useQuery<Location[]>({ queryKey: ['/api/locations'] });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);

  const createLocation = useMutation({
    mutationFn: async (payload: InsertLocation) => {
      const res = await fetch('/api/admin/locations', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/locations'] })
  });

  const updateLocation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLocation> }) => {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'PUT', headers: { 'content-type':'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/locations'] })
  });

  if (isLoading) return <div>Carregando localizações...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Localizações</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Localização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Localização' : 'Nova Localização'}</DialogTitle>
              <DialogDescription>Localizações do mapa</DialogDescription>
            </DialogHeader>
            <LocationForm initial={editing ?? undefined} onSubmit={async (data) => {
              try {
                if (editing) await updateLocation.mutateAsync({ id: editing.id, data });
                else await createLocation.mutateAsync(data as InsertLocation);
                setOpen(false); setEditing(null);
              } catch (e) { alert('Erro ao salvar localização'); }
            }} />
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{location.description}</p>
                  <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">{location.type}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(location); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={async () => { if (!confirm('Deletar localização?')) return; try { await fetch(`/api/admin/locations/${location.id}`, { method: 'DELETE' }); queryClient.invalidateQueries({ queryKey: ['/api/locations'] }); } catch (e) { alert('Falha ao deletar'); } }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LocationForm({ initial, onSubmit }: { initial?: Location; onSubmit: (data: Partial<InsertLocation>) => Promise<void> }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [mapX, setMapX] = useState(initial?.mapX ?? 0);
  const [mapY, setMapY] = useState(initial?.mapY ?? 0);
  const [type, setType] = useState(initial?.type ?? 'kingdom');
  const { language } = useLanguage();

  const loadTranslation = async (lang?: string) => {
    if (!initial?.id) return alert('Salve o item antes de carregar traduções');
    const l = lang ?? language;
    try {
      const res = await fetch(`/api/dev/translations/locations/${initial.id}?lang=${l}`);
      const data = await res.json();
      if (data?.translation) { setName(data.translation.name ?? name); setDescription(data.translation.description ?? description); }
      else alert('Nenhuma tradução encontrada');
    } catch (err) { alert('Erro ao carregar tradução'); }
  };

  const saveTranslation = async (lang?: string) => {
    if (!initial?.id) return alert('Salve o item antes de salvar traduções');
    const l = lang ?? language;
    try { await fetch(`/api/dev/translations/locations/${initial.id}`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ lang: l, data: { name, description } }) }); alert('Tradução salva'); } catch (err) { alert('Erro ao salvar tradução'); }
  };

  const autoTranslate = async (targetLang: string) => {
    try {
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ texts: [name, description], target: targetLang }) });
      const json = await res.json();
      if (json.translations?.length >= 2) {
        setName(json.translations[0]);
        setDescription(json.translations[1]);
      } else alert('Tradução automática não disponível');
    } catch (err) { alert('Erro na tradução automática'); }

  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit({ name, description, mapX, mapY, type }); }}>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Label>Descrição</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Mapa X (%)</Label>
            <Input type="number" value={mapX} onChange={(e) => setMapX(Number(e.target.value))} />
          </div>
          <div>
            <Label>Mapa Y (%)</Label>
            <Input type="number" value={mapY} onChange={(e) => setMapY(Number(e.target.value))} />
          </div>
        </div>
        <Label>Tipo</Label>
        <Input value={type} onChange={(e) => setType(e.target.value)} />
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadTranslation()}>Carregar tradução ({language})</Button>
            <Button variant="outline" onClick={() => saveTranslation()}>Salvar tradução ({language})</Button>
          </div>
          <div><Button type="submit">Salvar</Button></div>
        </div>
      </div>
    </form>
  );
}

function CodexManager() {
  const { t } = useLanguage();
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
  const { t } = useLanguage();
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