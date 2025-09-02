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
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const createChapter = useMutation({
    mutationFn: async (data: InsertChapter) => {
      return apiRequest('POST', '/api/admin/chapters', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chapters'] }),
  });

  const updateChapter = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertChapter> }) => {
      return apiRequest('PUT', `/api/admin/chapters/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chapters'] }),
  });

  const deleteChapter = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/chapters/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chapters'] }),
  });

  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async (payload: InsertChapter) => {
    await createChapter.mutateAsync(payload);
    setShowCreate(false);
    toast({ title: 'Capítulo criado' });
  };

  if (isLoading) {
    return <div>Carregando capítulos...</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Capítulos</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Capítulo
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{(chapter.titleI18n as any)?.[language] || chapter.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Capítulo {chapter.chapterNumber} • {chapter.readingTime} min
                  </p>
                    <p className="text-sm text-muted-foreground mt-1">
                    {(chapter.excerptI18n as any)?.[language] || chapter.excerpt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCreate(true);
                    // open with existing values for editing
                    (window as any).__admin_edit_defaults = { ...chapter };
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Confirmar exclusão do capítulo?')) return;
                    await deleteChapter.mutateAsync(chapter.id);
                    toast({ title: 'Capítulo excluído' });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showCreate && (
        <EntityForm
          type="chapter"
          onCancel={() => { setShowCreate(false); delete (window as any).__admin_edit_defaults; }}
          onSave={async (data) => {
            const editDefaults = (window as any).__admin_edit_defaults as any | undefined;
            if (editDefaults?.id) {
              await updateChapter.mutateAsync({ id: editDefaults.id, data });
              toast({ title: 'Capítulo atualizado' });
              delete (window as any).__admin_edit_defaults;
              setShowCreate(false);
            } else {
              await createChapter.mutateAsync(data as InsertChapter);
            }
          }}
          defaults={((window as any).__admin_edit_defaults) ?? {
            title: '',
            slug: '',
            content: '',
            contentI18n: { pt: '', en: '', es: '' },
            excerpt: '',
            excerptI18n: { pt: '', en: '', es: '' },
            titleI18n: { pt: '', en: '', es: '' },
            chapterNumber: (chapters[0]?.chapterNumber || 0) + 1,
            readingTime: 5,
            publishedAt: new Date(),
            imageUrl: '',
          }}
        />
      )}
    </div>
  );
}

function CharacterManager() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });

  const createCharacter = useMutation({
    mutationFn: async (data: InsertCharacter) => {
      await apiRequest('POST', '/api/admin/characters', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/characters'] }),
  });

  const updateCharacter = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCharacter> }) => {
      return apiRequest('PUT', `/api/admin/characters/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/characters'] }),
  });

  const deleteCharacter = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/characters/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/characters'] }),
  });

  const [showCreateChar, setShowCreateChar] = useState(false);

  const handleCreateCharacter = async (payload: InsertCharacter) => {
    const editDefaults = (window as any).__admin_edit_defaults as any | undefined;
    if (editDefaults?.id) {
      await updateCharacter.mutateAsync({ id: editDefaults.id, data: payload });
      toast({ title: 'Personagem atualizado' });
      delete (window as any).__admin_edit_defaults;
      setShowCreateChar(false);
      return;
    }
    await createCharacter.mutateAsync(payload);
    setShowCreateChar(false);
    toast({ title: 'Personagem criado' });
  };

  if (isLoading) {
    return <div>Carregando personagens...</div>;
  }

  return (
    <div className="space-y-6">

        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Personagens</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateChar(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Personagem
          </Button>
        </div>
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
                    <p className="text-sm text-primary">{(character.titleI18n as any)?.[language] || character.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(character.descriptionI18n as any)?.[language] || character.description}
                      </p>
                    <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                      {character.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCreateChar(true);
                    const ed = { ...character } as any;
                    if (ed.nameI18n) delete ed.nameI18n;
                    (window as any).__admin_edit_defaults = ed;
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Confirmar exclusão do personagem?')) return;
                    await deleteCharacter.mutateAsync(character.id);
                    toast({ title: 'Personagem excluído' });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showCreateChar && (
        <EntityForm
          type="character"
          onCancel={() => { setShowCreateChar(false); delete (window as any).__admin_edit_defaults; }}
          onSave={handleCreateCharacter}
          defaults={((window as any).__admin_edit_defaults) ?? {
            name: '',
            nameI18n: { pt: '', en: '', es: '' },
            title: '',
            titleI18n: { pt: '', en: '', es: '' },
            description: '',
            descriptionI18n: { pt: '', en: '', es: '' },
            imageUrl: '',
            role: 'protagonist',
          }}
        />
      )}
    </div>
  );
}

// Reusable inline form component for creating entities with per-language fields and image upload
function EntityForm<T extends Record<string, any>>({ type, onCancel, onSave, defaults }: {
  type: 'chapter' | 'character' | 'location' | 'codex' | 'blog';
  onCancel: () => void;
  onSave: (data: any) => Promise<void>;
  defaults: any;
}) {
  const [form, setForm] = useState<any>(defaults);
  const { language } = useLanguage();

  const uploadFile = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const res = await apiRequest('POST', '/api/admin/upload', { filename: file.name, data: dataUrl });
  const json = await res.json();
  return json.url as string;
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadFile(f);
    setForm((s: any) => ({ ...s, imageUrl: url }));
  };

  const handleField = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }));

  const handleI18n = (key: string, lang: string, value: string) => {
    setForm((s: any) => ({ ...s, [key]: { ...(s[key] || {}), [lang]: value } }));
  };

  const submit = async () => {
    // basic slug generation for chapters and blog
    if ((type === 'chapter' || type === 'blog') && !form.slug && form.title) {
      handleField('slug', form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  // Characters should not submit nameI18n
  const payload = { ...form };
  if (type === 'character' && payload.nameI18n) delete payload.nameI18n;
  await onSave(payload);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-2xl bg-background border border-border rounded p-6">
        <h3 className="text-lg font-bold mb-4">Criar {type}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* main fields */}
          <div>
            {'title' in form && (
              <>
                <Label>Title</Label>
                <Input value={form.title || ''} onChange={(e) => handleField('title', e.target.value)} />
              </>
            )}

            {'name' in form && (
              <>
                <Label>Name</Label>
                <Input value={form.name || ''} onChange={(e) => handleField('name', e.target.value)} />
              </>
            )}

            {'excerpt' in form && (
              <>
                <Label>Resumo</Label>
                <Textarea value={form.excerpt || ''} onChange={(e) => handleField('excerpt', e.target.value)} />
              </>
            )}

            {'description' in form && (
              <>
                <Label>Descrição</Label>
                <Textarea value={form.description || ''} onChange={(e) => handleField('description', e.target.value)} />
              </>
            )}

            <div className="mt-3">
              <Label>Imagem</Label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {form.imageUrl && <img src={form.imageUrl} className="mt-2 w-40 h-24 object-cover" />}
            </div>
          </div>

          {/* i18n fields */}
          <div>
            <h4 className="font-semibold mb-2">Traduções</h4>
            {['pt', 'en', 'es'].map((lng) => (
              <div key={lng} className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">{lng.toUpperCase()}</div>
                {'titleI18n' in form && (
                  <Input placeholder="Título" value={form.titleI18n?.[lng] || ''} onChange={(e) => handleI18n('titleI18n', lng, e.target.value)} />
                )}
                {'nameI18n' in form && type !== 'character' && (
                  <Input placeholder="Nome" value={form.nameI18n?.[lng] || ''} onChange={(e) => handleI18n('nameI18n', lng, e.target.value)} />
                )}
                {'contentI18n' in form && (
                  <Textarea placeholder="Conteúdo" value={form.contentI18n?.[lng] || ''} onChange={(e) => handleI18n('contentI18n', lng, e.target.value)} />
                )}
                {'descriptionI18n' in form && (
                  <Textarea placeholder="Descrição" value={form.descriptionI18n?.[lng] || ''} onChange={(e) => handleI18n('descriptionI18n', lng, e.target.value)} />
                )}
                {'excerptI18n' in form && (
                  <Input placeholder="Resumo" value={form.excerptI18n?.[lng] || ''} onChange={(e) => handleI18n('excerptI18n', lng, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={submit}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

function LocationManager() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  const { toast } = useToast();

  const createLocation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      await apiRequest('POST', '/api/admin/locations', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/locations'] }),
  });
  const updateLocation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLocation> }) => {
      return apiRequest('PUT', `/api/admin/locations/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/locations'] }),
  });
  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/locations/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/locations'] }),
  });

  const [showCreateLoc, setShowCreateLoc] = useState(false);

  const handleCreateLocation = async (payload: InsertLocation) => {
    await createLocation.mutateAsync(payload);
    setShowCreateLoc(false);
    toast({ title: 'Localização criada' });
  };

  if (isLoading) {
    return <div>Carregando localizações...</div>;
  }

  return (
    <div className="space-y-6">

        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Localizações</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateLoc(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Localização
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{(location.nameI18n as any)?.[language] || location.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(location.descriptionI18n as any)?.[language] || location.description}
                  </p>
                  <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                    {location.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCreateLoc(true);
                    (window as any).__admin_edit_defaults = { ...location };
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Confirmar exclusão da localização?')) return;
                    await deleteLocation.mutateAsync(location.id);
                    toast({ title: 'Localização excluída' });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showCreateLoc && (
        <EntityForm
          type="location"
          onCancel={() => setShowCreateLoc(false)}
          onSave={handleCreateLocation}
          defaults={{
            name: '',
            nameI18n: { pt: '', en: '', es: '' },
            description: '',
            descriptionI18n: { pt: '', en: '', es: '' },
            mapX: 50,
            mapY: 50,
            type: 'region',
          }}
        />
      )}
    </div>
  );
}

function CodexManager() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { data: entries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ['/api/codex'],
  });

  const createEntry = useMutation({
    mutationFn: async (data: InsertCodexEntry) => {
      await apiRequest('POST', '/api/admin/codex', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/codex'] }),
  });
  const updateCodex = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCodexEntry> }) => {
      return apiRequest('PUT', `/api/admin/codex/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/codex'] }),
  });
  const deleteCodex = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/codex/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/codex'] }),
  });

  const { toast } = useToast();
  const [showCreateCodex, setShowCreateCodex] = useState(false);

  const handleCreateEntry = async (payload: InsertCodexEntry) => {
    await createEntry.mutateAsync(payload);
    setShowCreateCodex(false);
    toast({ title: 'Entrada do codex criada' });
  };

  if (isLoading) {
    return <div>Carregando entradas do codex...</div>;
  }

  return (
    <div className="space-y-6">

        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Codex</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateCodex(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrada
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{(entry.titleI18n as any)?.[language] || entry.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(entry.descriptionI18n as any)?.[language] || entry.description}
                  </p>
                  <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                    {entry.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCreateCodex(true);
                    (window as any).__admin_edit_defaults = { ...entry };
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Confirmar exclusão da entrada do codex?')) return;
                    await deleteCodex.mutateAsync(entry.id);
                    toast({ title: 'Entrada excluída' });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showCreateCodex && (
        <EntityForm
          type="codex"
          onCancel={() => setShowCreateCodex(false)}
          onSave={handleCreateEntry}
          defaults={{
            title: '',
            titleI18n: { pt: '', en: '', es: '' },
            description: '',
            descriptionI18n: { pt: '', en: '', es: '' },
            category: 'magic',
            imageUrl: '',
          }}
        />
      )}
    </div>
  );
}

function BlogManager() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const createPost = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      await apiRequest('POST', '/api/admin/blog', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/blog'] }),
  });
  const updatePost = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlogPost> }) => {
      return apiRequest('PUT', `/api/admin/blog/${id}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/blog'] }),
  });
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/blog/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/blog'] }),
  });

  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePost = async (payload: InsertBlogPost) => {
    await createPost.mutateAsync(payload);
    setShowCreatePost(false);
    toast({ title: 'Post criado' });
  };

  if (isLoading) {
    return <div>Carregando posts do blog...</div>;
  }

  return (
    <div className="space-y-6">

        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Blog</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreatePost(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>
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
                    <h3 className="font-semibold">{(post.titleI18n as any)?.[language] || post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(post.excerptI18n as any)?.[language] || post.excerpt}
                    </p>
                    <span className="inline-block bg-muted px-2 py-1 rounded text-xs mt-2">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowCreatePost(true);
                    (window as any).__admin_edit_defaults = { ...post };
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!confirm('Confirmar exclusão do post?')) return;
                    await deletePost.mutateAsync(post.id);
                    toast({ title: 'Post excluído' });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showCreatePost && (
        <EntityForm
          type="blog"
          onCancel={() => setShowCreatePost(false)}
          onSave={handleCreatePost}
          defaults={{
            title: '',
            titleI18n: { pt: '', en: '', es: '' },
            slug: '',
            content: '',
            contentI18n: { pt: '', en: '', es: '' },
            excerpt: '',
            excerptI18n: { pt: '', en: '', es: '' },
            category: 'update',
            publishedAt: new Date(),
            imageUrl: '',
          }}
        />
      )}
    </div>
  );
}