import { 
  type Chapter, type InsertChapter,
  type Character, type InsertCharacter,
  type Location, type InsertLocation,
  type CodexEntry, type InsertCodexEntry,
  type BlogPost, type InsertBlogPost,
  type ReadingProgress, type InsertReadingProgress,
  type User, type UpsertUser,
  chapters, characters, locations, codexEntries, blogPosts, readingProgress, users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from 'fs';
import path from 'path';

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chapter operations
  getChapters(): Promise<Chapter[]>;
  getChapterBySlug(slug: string): Promise<Chapter | undefined>;
  getChapterById(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;

  // Character operations
  getCharacters(): Promise<Character[]>;
  getCharacterById(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<boolean>;

  // Location operations
  getLocations(): Promise<Location[]>;
  getLocationById(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;

  // Codex operations
  getCodexEntries(): Promise<CodexEntry[]>;
  getCodexEntriesByCategory(category: string): Promise<CodexEntry[]>;
  getCodexEntryById(id: string): Promise<CodexEntry | undefined>;
  createCodexEntry(entry: InsertCodexEntry): Promise<CodexEntry>;
  updateCodexEntry(id: string, entry: Partial<InsertCodexEntry>): Promise<CodexEntry | undefined>;
  deleteCodexEntry(id: string): Promise<boolean>;

  // Blog operations
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // Reading progress operations
  getReadingProgress(sessionId: string, chapterId: string): Promise<ReadingProgress | undefined>;
  updateReadingProgress(sessionId: string, chapterId: string, progress: number): Promise<ReadingProgress>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chapter methods
  async getChapters(): Promise<Chapter[]> {
    try {
      return await db.select().from(chapters).orderBy(chapters.chapterNumber);
    } catch (error) {
      console.error('DB error in getChapters:', error);
      return [];
    }
  }

  async getChapterBySlug(slug: string): Promise<Chapter | undefined> {
    try {
      const [chapter] = await db.select().from(chapters).where(eq(chapters.slug, slug));
      return chapter;
    } catch (error) {
      console.error('DB error in getChapterBySlug:', error);
      return undefined;
    }
  }

  async getChapterById(id: string): Promise<Chapter | undefined> {
    try {
      const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
      return chapter;
    } catch (error) {
      console.error('DB error in getChapterById:', error);
      return undefined;
    }
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    return newChapter;
  }

  async updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const [updatedChapter] = await db
      .update(chapters)
      .set(chapter)
      .where(eq(chapters.id, id))
      .returning();
    return updatedChapter;
  }

  async deleteChapter(id: string): Promise<boolean> {
    const result = await db.delete(chapters).where(eq(chapters.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Character methods
  async getCharacters(): Promise<Character[]> {
    try {
      return await db.select().from(characters);
    } catch (error) {
      console.error('DB error in getCharacters:', error);
      // Fallback: return any offline-cached characters saved while DB was down
      try {
        const offlineFile = path.resolve(process.cwd(), 'data', 'offline-characters.json');
        const data = await fs.promises.readFile(offlineFile, 'utf-8');
        const arr = JSON.parse(data || '[]');
        return arr as Character[];
      } catch (fileErr) {
        // no offline cache available
        return [];
      }
    }
  }

  async getCharacterById(id: string): Promise<Character | undefined> {
    try {
      const [character] = await db.select().from(characters).where(eq(characters.id, id));
      return character;
    } catch (error) {
      console.error('DB error in getCharacterById:', error);
      // Fallback to offline cache
      try {
        const offlineFile = path.resolve(process.cwd(), 'data', 'offline-characters.json');
        const data = await fs.promises.readFile(offlineFile, 'utf-8');
        const arr = JSON.parse(data || '[]');
        return arr.find((c: any) => c.id === id) as Character | undefined;
      } catch (fileErr) {
        return undefined;
      }
    }
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }

  async updateCharacter(id: string, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(character)
      .where(eq(characters.id, id))
      .returning();
    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    try {
      return await db.select().from(locations);
    } catch (error) {
      console.error('DB error in getLocations:', error);
      // Fallback: read offline locations
      try {
        const offlineFile = path.resolve(process.cwd(), 'data', 'offline-locations.json');
        const data = await fs.promises.readFile(offlineFile, 'utf-8');
        const arr = JSON.parse(data || '[]');
        return arr as Location[];
      } catch (fileErr) {
        return [];
      }
    }
  }

  async getLocationById(id: string): Promise<Location | undefined> {
    try {
      const [location] = await db.select().from(locations).where(eq(locations.id, id));
      return location;
    } catch (error) {
      console.error('DB error in getLocationById:', error);
      return undefined;
    }
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(locations)
      .set(location)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Codex methods
  async getCodexEntries(): Promise<CodexEntry[]> {
    try {
      return await db.select().from(codexEntries);
    } catch (error) {
      console.error('DB error in getCodexEntries:', error);
      // Fallback: read offline codex entries
      try {
        const offlineFile = path.resolve(process.cwd(), 'data', 'offline-codex.json');
        const data = await fs.promises.readFile(offlineFile, 'utf-8');
        const arr = JSON.parse(data || '[]');
        return arr as CodexEntry[];
      } catch (fileErr) {
        return [];
      }
    }
  }

  async getCodexEntriesByCategory(category: string): Promise<CodexEntry[]> {
    try {
      return await db.select().from(codexEntries).where(eq(codexEntries.category, category));
    } catch (error) {
      console.error('DB error in getCodexEntriesByCategory:', error);
      return [];
    }
  }

  async getCodexEntryById(id: string): Promise<CodexEntry | undefined> {
    try {
      const [entry] = await db.select().from(codexEntries).where(eq(codexEntries.id, id));
      return entry;
    } catch (error) {
      console.error('DB error in getCodexEntryById:', error);
      return undefined;
    }
  }

  async createCodexEntry(entry: InsertCodexEntry): Promise<CodexEntry> {
    const [newEntry] = await db.insert(codexEntries).values(entry).returning();
    return newEntry;
  }

  async updateCodexEntry(id: string, entry: Partial<InsertCodexEntry>): Promise<CodexEntry | undefined> {
    const [updatedEntry] = await db
      .update(codexEntries)
      .set(entry)
      .where(eq(codexEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteCodexEntry(id: string): Promise<boolean> {
    const result = await db.delete(codexEntries).where(eq(codexEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Blog methods
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      return await db.select().from(blogPosts).orderBy(blogPosts.publishedAt);
    } catch (error) {
      console.error('DB error in getBlogPosts:', error);
      return [];
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
      return post;
    } catch (error) {
      console.error('DB error in getBlogPostBySlug:', error);
      return undefined;
    }
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set(post)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Reading progress methods
  async getReadingProgress(sessionId: string, chapterId: string): Promise<ReadingProgress | undefined> {
    try {
      const [progress] = await db
        .select()
        .from(readingProgress)
        .where(eq(readingProgress.sessionId, sessionId))
        .where(eq(readingProgress.chapterId, chapterId));
      return progress;
    } catch (error) {
      console.error('DB error in getReadingProgress:', error);
      return undefined;
    }
  }

  async updateReadingProgress(sessionId: string, chapterId: string, progress: number): Promise<ReadingProgress> {
    // Try to update existing record first
    try {
      const [existingProgress] = await db
        .update(readingProgress)
        .set({
          progress,
          lastReadAt: new Date(),
        })
        .where(eq(readingProgress.sessionId, sessionId))
        .where(eq(readingProgress.chapterId, chapterId))
        .returning();

      if (existingProgress) {
        return existingProgress;
      }

      // Create new record if doesn't exist
      const [newProgress] = await db
        .insert(readingProgress)
        .values({
          sessionId,
          chapterId,
          progress,
          lastReadAt: new Date(),
        })
        .returning();

      return newProgress;
    } catch (error) {
      console.error('DB error in updateReadingProgress:', error);
      throw error;
    }
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingChapters = await this.getChapters();
      if (existingChapters.length > 0) {
        return; // Data already seeded
      }

      // Seed chapters
      const chapter1: InsertChapter = {
        title: "O Despertar dos Poderes Antigos",
        slug: "despertar-poderes-antigos",
        content: `As brumas do tempo se separaram como cortinas antigas, revelando um mundo que Eldric mal reconhecia. Onde antes a Grande Espiral de Luminar perfurava os céus, agora apenas ruínas permaneciam, tomadas por vinhas espinhosas que pulsavam com escuridão antinatural.

Ele deu um passo à frente, suas botas desgastadas esmagando fragmentos cristalinos que antes eram janelas para outros reinos. Três séculos. Era esse o tempo que ele havia ficado selado no Vazio Entre Mundos, e em sua ausência, tudo o que ele havia lutado para proteger havia desmoronado.

"Os selos estão quebrados", ele sussurrou, sua voz carregando poder que fez o próprio ar tremer. Atrás dele, a realidade se curvou e torceu conforme sua aura mágica despertava após seu longo sono. "E a escuridão criou raízes onde a luz antes floresceu."

O Primeiro Feiticeiro havia retornado, mas o mundo que ele conhecia se foi para sempre. Em seu lugar estava um reino consumido pelas sombras, onde o próprio tecido da magia havia sido corrompido. Ainda assim, dentro dessa corrupção, Eldric sentiu algo mais - uma presença familiar, antiga e malévola.

"Malachar", ele suspirou, o nome tendo gosto de cinzas em sua língua. Seu antigo aprendiz, aquele em quem havia confiado acima de todos os outros, aquele cuja traição havia levado ao seu aprisionamento. O Rei das Sombras não apenas havia sobrevivido aos séculos; ele havia prosperado.`,
        excerpt: "Eldric descobre a câmara oculta sob a Grande Biblioteca, onde os primeiros feitiços já escritos ainda pulsam com energia adormecida...",
        chapterNumber: 15,
        readingTime: 12,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      };

      const chapter2: InsertChapter = {
        title: "Sombras no Horizonte",
        slug: "sombras-no-horizonte",
        content: "Os exércitos dos Reinos do Norte se reúnem enquanto presságios sombrios aparecem pelo céu. A guerra parece inevitável...",
        excerpt: "Os exércitos dos Reinos do Norte se reúnem enquanto presságios sombrios aparecem pelo céu. A guerra parece inevitável...",
        chapterNumber: 14,
        readingTime: 15,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      };

      const chapter3: InsertChapter = {
        title: "Os Bosques Sussurrantes",
        slug: "bosques-sussurrantes",
        content: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades mágicas...",
        excerpt: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades mágicas...",
        chapterNumber: 13,
        readingTime: 18,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      };

      await this.createChapter(chapter1);
      await this.createChapter(chapter2);
      await this.createChapter(chapter3);

      // Seed characters
      const aslam: InsertCharacter = {
        name: "Aslam Arianthe",
        title: "O Primeiro Feiticeiro",
        description: "Antigo e poderoso, Aslam retorna após séculos para encontrar seu mundo transformado pela guerra e escuridão. Gentil e compassivo, apesar de seu poder imenso, carrega uma solidão por ser 'diferente'.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "protagonist",
      };

      const lyra: InsertCharacter = {
        name: "Lyra Stormweaver",
        title: "Conjuradora de Tempestades",
        description: "Uma jovem maga com cabelos negros e túnica azul adornada com runas antigas. Seus olhos brilhantes sugerem suas habilidades mágicas, determinada mas tensa.",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "protagonist",
      };

      const aldrich: InsertCharacter = {
        name: "Lorde Aldrich Sylvaris",
        title: "Cabeça da Casa Sylvaris",
        description: "Senhor imponente de tom ébano profundo e cabelo raspado com barba cheia. Líder da poderosa Casa Sylvaris, com 46 anos e nível de anel de mana 3.1.",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "supporting",
      };

      const kellen: InsertCharacter = {
        name: "Kellen Aurelio",
        title: "Guerreiro Experiente",
        description: "Alto e musculoso, com cabelos negros e olhos intensos. Veste uma armadura marcada por batalhas que contam histórias de combates passados.",
        imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "supporting",
      };

      await this.createCharacter(aslam);
      await this.createCharacter(lyra);
      await this.createCharacter(aldrich);
      await this.createCharacter(kellen);

      // Seed locations
      const valaria: InsertLocation = {
        name: "Reino de Valaria",
        description: "Capital próspera onde residem nobres e artesãos. Centro político e cultural com arquitetura majestosa.",
        mapX: 33,
        mapY: 25,
        type: "capital",
      };

      const aethermoor: InsertLocation = {
        name: "Cidade Flutuante de Aethermoor",
        description: "Maravilha da engenharia mágica, suspensa no ar por cristais encantados. Centro de conhecimento arcano.",
        mapX: 75,
        mapY: 50,
        type: "forest",
      };

      const monteNuvens: InsertLocation = {
        name: "Monte Nuvens",
        description: "Montanha imponente onde o vento sopra forte e os picos tocam as nuvens. Local de poder e mistério.",
        mapX: 25,
        mapY: 67,
        type: "shadowlands",
      };

      await this.createLocation(valaria);
      await this.createLocation(aethermoor);
      await this.createLocation(monteNuvens);

      // Seed blog posts
      const blogPost1: InsertBlogPost = {
        title: "Criando os Sistemas Mágicos de Aethermoor",
        slug: "criando-sistemas-magicos",
        content: "Mergulhe na inspiração e pesquisa por trás do complexo framework mágico que alimenta esta épica narrativa. Exploramos como os Anéis de Mana funcionam e como diferentes níveis determinam o poder dos feiticeiros...",
        excerpt: "Mergulhe na inspiração e pesquisa por trás do complexo framework mágico que alimenta esta épica narrativa...",
        category: "construção-de-mundo",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      };

      await this.createBlogPost(blogPost1);

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

// Local file-based storage for offline development
class LocalFileStorage implements IStorage {
  private dataDir: string;
  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
    } catch (e) {}
  }

  // Users
  async getUser(id: string) {
    try {
      const file = path.join(this.dataDir, 'users.json');
      const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
      const arr = JSON.parse(data || '[]');
      return arr.find((u: any) => u.id === id) as any | undefined;
    } catch (e) {
      return undefined;
    }
  }

  async upsertUser(userData: any) {
    const file = path.join(this.dataDir, 'users.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    const arr = JSON.parse(data || '[]');
    const idx = arr.findIndex((u: any) => u.id === userData.id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...userData, updatedAt: new Date().toISOString() };
    else arr.push({ ...userData, createdAt: new Date().toISOString() });
    await fs.promises.writeFile(file, JSON.stringify(arr, null, 2), 'utf-8');
    return userData as any;
  }

  // Chapters
  async getChapters() {
    const file = path.join(this.dataDir, 'offline-chapters.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    return JSON.parse(data || '[]');
  }
  async getChapterBySlug(slug: string) {
    const arr = await this.getChapters();
    return arr.find((c: any) => c.slug === slug);
  }
  async getChapterById(id: string) {
    const arr = await this.getChapters();
    return arr.find((c: any) => c.id === id);
  }
  async createChapter(chapter: any) {
    const arr = await this.getChapters();
    const record = { id: randomUUID(), ...chapter } as any;
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-chapters.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return record;
  }
  async updateChapter(id: string, chapter: any) {
    const arr = await this.getChapters();
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx < 0) return undefined;
    arr[idx] = { ...arr[idx], ...chapter, updatedAt: new Date().toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-chapters.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return arr[idx];
  }
  async deleteChapter(id: string) {
    const arr = await this.getChapters();
    const filtered = arr.filter((c: any) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-chapters.json'), JSON.stringify(filtered, null, 2), 'utf-8');
    return arr.length !== filtered.length;
  }

  // Characters
  async getCharacters() {
    const file = path.join(this.dataDir, 'offline-characters.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    return JSON.parse(data || '[]');
  }
  async getCharacterById(id: string) {
    const arr = await this.getCharacters();
    return arr.find((c: any) => c.id === id);
  }
  async createCharacter(character: any) {
    const arr = await this.getCharacters();
    const record = { id: randomUUID(), ...character } as any;
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-characters.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return record;
  }
  async updateCharacter(id: string, character: any) {
    const arr = await this.getCharacters();
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx < 0) return undefined;
    arr[idx] = { ...arr[idx], ...character, updatedAt: new Date().toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-characters.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return arr[idx];
  }
  async deleteCharacter(id: string) {
    const arr = await this.getCharacters();
    const filtered = arr.filter((c: any) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-characters.json'), JSON.stringify(filtered, null, 2), 'utf-8');
    return arr.length !== filtered.length;
  }

  // Locations
  async getLocations() {
    const file = path.join(this.dataDir, 'offline-locations.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    return JSON.parse(data || '[]');
  }
  async getLocationById(id: string) {
    const arr = await this.getLocations();
    return arr.find((c: any) => c.id === id);
  }
  async createLocation(location: any) {
    const arr = await this.getLocations();
    const record = { id: randomUUID(), ...location } as any;
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-locations.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return record;
  }
  async updateLocation(id: string, location: any) {
    const arr = await this.getLocations();
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx < 0) return undefined;
    arr[idx] = { ...arr[idx], ...location, updatedAt: new Date().toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-locations.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return arr[idx];
  }
  async deleteLocation(id: string) {
    const arr = await this.getLocations();
    const filtered = arr.filter((c: any) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-locations.json'), JSON.stringify(filtered, null, 2), 'utf-8');
    return arr.length !== filtered.length;
  }

  // Codex
  async getCodexEntries() {
    const file = path.join(this.dataDir, 'offline-codex.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    return JSON.parse(data || '[]');
  }
  async getCodexEntriesByCategory(category: string) {
    const arr = await this.getCodexEntries();
    return arr.filter((e: any) => e.category === category);
  }
  async getCodexEntryById(id: string) {
    const arr = await this.getCodexEntries();
    return arr.find((c: any) => c.id === id);
  }
  async createCodexEntry(entry: any) {
    const arr = await this.getCodexEntries();
    const record = { id: randomUUID(), ...entry } as any;
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-codex.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return record;
  }
  async updateCodexEntry(id: string, entry: any) {
    const arr = await this.getCodexEntries();
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx < 0) return undefined;
    arr[idx] = { ...arr[idx], ...entry, updatedAt: new Date().toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-codex.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return arr[idx];
  }
  async deleteCodexEntry(id: string) {
    const arr = await this.getCodexEntries();
    const filtered = arr.filter((c: any) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-codex.json'), JSON.stringify(filtered, null, 2), 'utf-8');
    return arr.length !== filtered.length;
  }

  // Blog
  async getBlogPosts() {
    const file = path.join(this.dataDir, 'offline-blog.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    return JSON.parse(data || '[]');
  }
  async getBlogPostBySlug(slug: string) {
    const arr = await this.getBlogPosts();
    return arr.find((b: any) => b.slug === slug);
  }
  async getBlogPostById(id: string) {
    const arr = await this.getBlogPosts();
    return arr.find((b: any) => b.id === id);
  }
  async createBlogPost(post: any) {
    const arr = await this.getBlogPosts();
    const record = { id: randomUUID(), ...post } as any;
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-blog.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return record;
  }
  async updateBlogPost(id: string, post: any) {
    const arr = await this.getBlogPosts();
    const idx = arr.findIndex((c: any) => c.id === id);
    if (idx < 0) return undefined;
    arr[idx] = { ...arr[idx], ...post, updatedAt: new Date().toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-blog.json'), JSON.stringify(arr, null, 2), 'utf-8');
    return arr[idx];
  }
  async deleteBlogPost(id: string) {
    const arr = await this.getBlogPosts();
    const filtered = arr.filter((c: any) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, 'offline-blog.json'), JSON.stringify(filtered, null, 2), 'utf-8');
    return arr.length !== filtered.length;
  }

  // Reading progress (session-only offline)
  async getReadingProgress(sessionId: string, chapterId: string) {
    const file = path.join(this.dataDir, 'offline-reading.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    const arr = JSON.parse(data || '[]');
    return arr.find((r: any) => r.sessionId === sessionId && r.chapterId === chapterId);
  }
  async updateReadingProgress(sessionId: string, chapterId: string, progress: number) {
    const file = path.join(this.dataDir, 'offline-reading.json');
    const data = await fs.promises.readFile(file, 'utf-8').catch(() => '[]');
    const arr = JSON.parse(data || '[]');
    const idx = arr.findIndex((r: any) => r.sessionId === sessionId && r.chapterId === chapterId);
    if (idx >= 0) {
      arr[idx].progress = progress;
      arr[idx].lastReadAt = new Date().toISOString();
    } else {
      arr.push({ sessionId, chapterId, progress, lastReadAt: new Date().toISOString() });
    }
    await fs.promises.writeFile(file, JSON.stringify(arr, null, 2), 'utf-8');
    return arr.find((r: any) => r.sessionId === sessionId && r.chapterId === chapterId);
  }
}

// Decide storage backend: offline file storage if OFFLINE_MODE=1 or DB is unreachable
let storageImpl: IStorage;
if (process.env.OFFLINE_MODE === '1') {
  storageImpl = new LocalFileStorage();
  console.log('Using LocalFileStorage (OFFLINE_MODE=1)');
} else {
  try {
    storageImpl = new DatabaseStorage();
  } catch (err) {
    console.warn('Failed to initialize DatabaseStorage, falling back to LocalFileStorage:', err);
    storageImpl = new LocalFileStorage();
  }
}

export const storage = storageImpl;