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
import { eq, and } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
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
  getCharacterBySlug(slug: string): Promise<Character | undefined>;
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

  // Helper: create a filesystem-safe, url-friendly slug
  private slugify(input?: string) {
    const s = (input || "").toString().trim().toLowerCase();
    // remove diacritics
    const normalized = s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s;
    return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');
  }

  // Ensure the slug is unique in `characters`. If `ignoreId` is provided, that row is excluded
  private async ensureUniqueCharacterSlug(desiredSlug: string, ignoreId?: string) {
    let base = this.slugify(desiredSlug) || this.slugify(desiredSlug) || 'char';
    let slug = base;
    let i = 0;
    // loop until we find a slug that isn't taken
    while (true) {
      const rows: any[] = await db.select().from(characters).where(eq(characters.slug, slug));
      const existing = rows.find((r) => (ignoreId ? r.id !== ignoreId : true));
      if (!existing) return slug;
      i += 1;
      slug = `${base}-${i}`;
      // safety: avoid infinite loops
      if (i > 50) return `${base}-${Date.now()}`;
    }
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
          updatedAt: new Date().toISOString(),
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
    // Ensure we have an id so we can reliably read back the inserted row
    const payload: any = { ...chapter };
    if (!payload.id) payload.id = randomUUID();

    try {
      const [newChapter] = await db.insert(chapters).values(payload).returning();
      if (newChapter) return newChapter;
    } catch (e) {
      // Some drivers/adapters (or SQLite builds) may not support returning();
      // fallthrough to SELECT-based fallback below.
      console.warn('Insert returning not supported or failed for chapters, falling back to SELECT:', e);
    }

    // Fallback: select by id
    const [f] = await db.select().from(chapters).where(eq(chapters.id, payload.id));
    if (f) return f;
    // As a last resort, return the payload (best-effort)
    return payload as Chapter;
  }

  async updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined> {
    try {
      const [updatedChapter] = await db
        .update(chapters)
        .set(chapter)
        .where(eq(chapters.id, id))
        .returning();
      if (updatedChapter) return updatedChapter;
    } catch (e) {
      console.warn('Update returning not supported or failed for chapters, falling back to SELECT:', e);
    }

    const [f] = await db.select().from(chapters).where(eq(chapters.id, id));
    return f;
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

  async getCharacterBySlug(slug: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.slug, slug));
    return character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const payload: any = { ...character };
    if (!payload.id) payload.id = randomUUID();
    // Ensure slug exists and is unique
    try {
      payload.slug = await this.ensureUniqueCharacterSlug(payload.slug || payload.name || payload.id);
    } catch (e) {
      // best-effort: fallback to slugify
      payload.slug = this.slugify(payload.slug || payload.name || payload.id);
    }
    try {
      const [newCharacter] = await db.insert(characters).values(payload).returning();
      if (newCharacter) return newCharacter;
    } catch (e) {
      console.warn('Insert returning not supported or failed for characters, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(characters).where(eq(characters.id, payload.id));
    if (f) return f;
    return payload as Character;
  }

  async updateCharacter(id: string, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    // If slug provided (or name changed), ensure uniqueness ignoring this id
    const toUpdate: any = { ...character };
    if (toUpdate.slug || toUpdate.name) {
      try {
        toUpdate.slug = await this.ensureUniqueCharacterSlug(toUpdate.slug || toUpdate.name || id, id);
      } catch (e) {
        toUpdate.slug = this.slugify(toUpdate.slug || toUpdate.name || id);
      }
    }

    try {
      const [updatedCharacter] = await db
        .update(characters)
        .set(toUpdate)
        .where(eq(characters.id, id))
        .returning();
      if (updatedCharacter) return updatedCharacter;
    } catch (e) {
      console.warn('Update returning not supported or failed for characters, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(characters).where(eq(characters.id, id));
    return f;
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
    const payload: any = { ...location };
    if (!payload.id) payload.id = randomUUID();
    try {
      const [newLocation] = await db.insert(locations).values(payload).returning();
      if (newLocation) return newLocation;
    } catch (e) {
      console.warn('Insert returning not supported or failed for locations, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(locations).where(eq(locations.id, payload.id));
    if (f) return f;
    return payload as Location;
  }

  async updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined> {
    try {
      const [updatedLocation] = await db
        .update(locations)
        .set(location)
        .where(eq(locations.id, id))
        .returning();
      if (updatedLocation) return updatedLocation;
    } catch (e) {
      console.warn('Update returning not supported or failed for locations, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(locations).where(eq(locations.id, id));
    return f;
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
    const payload: any = { ...entry };
    if (!payload.id) payload.id = randomUUID();
    try {
      const [newEntry] = await db.insert(codexEntries).values(payload).returning();
      if (newEntry) return newEntry;
    } catch (e) {
      console.warn('Insert returning not supported or failed for codex entries, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(codexEntries).where(eq(codexEntries.id, payload.id));
    if (f) return f;
    return payload as CodexEntry;
  }

  async updateCodexEntry(id: string, entry: Partial<InsertCodexEntry>): Promise<CodexEntry | undefined> {
    try {
      const [updatedEntry] = await db
        .update(codexEntries)
        .set(entry)
        .where(eq(codexEntries.id, id))
        .returning();
      if (updatedEntry) return updatedEntry;
    } catch (e) {
      console.warn('Update returning not supported or failed for codex entries, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(codexEntries).where(eq(codexEntries.id, id));
    return f;
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
    const payload: any = { ...post };
    if (!payload.id) payload.id = randomUUID();
    // Ensure slug exists and is unique for blog posts
    try {
      payload.slug = await this.ensureUniqueCharacterSlug(payload.slug || payload.title || payload.id);
    } catch (e) {
      payload.slug = this.slugify(payload.slug || payload.title || payload.id);
    }
    try {
      const [newPost] = await db.insert(blogPosts).values(payload).returning();
      if (newPost) return newPost;
    } catch (e) {
      console.warn('Insert returning not supported or failed for blog posts, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(blogPosts).where(eq(blogPosts.id, payload.id));
    if (f) return f;
    return payload as BlogPost;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const toUpdate: any = { ...post };
    if (toUpdate.slug || toUpdate.title) {
      try {
        toUpdate.slug = await this.ensureUniqueCharacterSlug(toUpdate.slug || toUpdate.title || id, id);
      } catch (e) {
        toUpdate.slug = this.slugify(toUpdate.slug || toUpdate.title || id);
      }
    }

    try {
      const [updatedPost] = await db
        .update(blogPosts)
        .set(toUpdate)
        .where(eq(blogPosts.id, id))
        .returning();
      if (updatedPost) return updatedPost;
    } catch (e) {
      console.warn('Update returning not supported or failed for blog posts, falling back to SELECT:', e);
    }
    const [f] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return f;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Reading progress methods
  async getReadingProgress(sessionId: string, chapterId: string): Promise<ReadingProgress | undefined> {
<<<<<<< HEAD
    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(and(eq(readingProgress.sessionId, sessionId), eq(readingProgress.chapterId, chapterId)));
    return progress;
=======
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
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
  }

  async updateReadingProgress(sessionId: string, chapterId: string, progress: number): Promise<ReadingProgress> {
    // Try to update existing record first
<<<<<<< HEAD
    const [existingProgress] = await db
      .update(readingProgress)
      .set(({
        progress,
    lastReadAt: new Date().toISOString(),
      } as any))
      .where(and(eq(readingProgress.sessionId, sessionId), eq(readingProgress.chapterId, chapterId)))
      .returning();
=======
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
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a

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
<<<<<<< HEAD

    // Create new record if doesn't exist
    const [newProgress] = await db
      .insert(readingProgress)
      .values(({
        sessionId,
        chapterId,
        progress,
        lastReadAt: new Date().toISOString(),
      } as any))
      .returning();

    return newProgress;
=======
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
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
  publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      };

      const chapter2: InsertChapter = {
        title: "Sombras no Horizonte",
        slug: "sombras-no-horizonte",
        content: "Os exércitos dos Reinos do Norte se reúnem enquanto presságios sombrios aparecem pelo céu. A guerra parece inevitável...",
        excerpt: "Os exércitos dos Reinos do Norte se reúnem enquanto presságios sombrios aparecem pelo céu. A guerra parece inevitável...",
        chapterNumber: 14,
        readingTime: 15,
  publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      };

      const chapter3: InsertChapter = {
        title: "Os Bosques Sussurrantes",
        slug: "bosques-sussurrantes",
        content: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades mágicas...",
        excerpt: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades mágicas...",
        chapterNumber: 13,
        readingTime: 18,
  publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
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
  publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      };

      await this.createBlogPost(blogPost1);

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

<<<<<<< HEAD
// Simple file-based storage fallback for local development when DB is unavailable.
class FileStorage implements IStorage {
  private baseDir = path.resolve(process.cwd(), 'data');

  constructor() {
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  // helper
  private async readFile<T>(name: string, defaultValue: T): Promise<T> {
    const fp = path.join(this.baseDir, name);
    try {
      const txt = await fs.promises.readFile(fp, 'utf-8');
      return JSON.parse(txt || 'null') as T;
    } catch (e) {
      return defaultValue;
    }
  }

  private async writeFile(name: string, data: any) {
    const fp = path.join(this.baseDir, name);
    await fs.promises.writeFile(fp, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getUser(id: string) {
    const users = await this.readFile<any[]>('offline-users.json', []);
    return users.find((u) => u.id === id);
  }

  async upsertUser(user: any) {
    const users = await this.readFile<any[]>('offline-users.json', []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    await this.writeFile('offline-users.json', users);
    return users.find((u) => u.id === user.id);
  }

  async getChapters() { return this.readFile<any[]>('offline-chapters.json', []); }
  async getChapterBySlug(slug: string) { const arr = await this.getChapters(); return arr.find((c) => c.slug === slug); }
  async getChapterById(id: string) { const arr = await this.getChapters(); return arr.find((c) => c.id === id); }
  async createChapter(chapter: any) { chapter.id = chapter.id ?? randomUUID(); const arr = await this.getChapters(); arr.push(chapter); await this.writeFile('offline-chapters.json', arr); return chapter; }
  async updateChapter(id: string, chapter: any) { const arr = await this.getChapters(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return undefined; arr[idx] = { ...arr[idx], ...chapter }; await this.writeFile('offline-chapters.json', arr); return arr[idx]; }
  async deleteChapter(id: string) { const arr = await this.getChapters(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return false; arr.splice(idx, 1); await this.writeFile('offline-chapters.json', arr); return true; }

  async getCharacters() { return this.readFile<any[]>('offline-characters.json', []); }
  async getCharacterById(id: string) { const arr = await this.getCharacters(); return arr.find((c) => c.id === id); }
  async getCharacterBySlug(slug: string) { const arr = await this.getCharacters(); return arr.find((c) => c.slug === slug); }
  async createCharacter(character: any) { character.id = character.id ?? randomUUID(); const arr = await this.getCharacters(); arr.push(character); await this.writeFile('offline-characters.json', arr); return character; }
  async updateCharacter(id: string, character: any) { const arr = await this.getCharacters(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return undefined; arr[idx] = { ...arr[idx], ...character }; await this.writeFile('offline-characters.json', arr); return arr[idx]; }
  async deleteCharacter(id: string) { const arr = await this.getCharacters(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return false; arr.splice(idx, 1); await this.writeFile('offline-characters.json', arr); return true; }

  async getLocations() { return this.readFile<any[]>('offline-locations.json', []); }
  async getLocationById(id: string) { const arr = await this.getLocations(); return arr.find((c) => c.id === id); }
  async createLocation(location: any) { location.id = location.id ?? randomUUID(); const arr = await this.getLocations(); arr.push(location); await this.writeFile('offline-locations.json', arr); return location; }
  async updateLocation(id: string, location: any) { const arr = await this.getLocations(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return undefined; arr[idx] = { ...arr[idx], ...location }; await this.writeFile('offline-locations.json', arr); return arr[idx]; }
  async deleteLocation(id: string) { const arr = await this.getLocations(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return false; arr.splice(idx, 1); await this.writeFile('offline-locations.json', arr); return true; }

  async getCodexEntries() { return this.readFile<any[]>('offline-codex.json', []); }
  async getCodexEntriesByCategory(category: string) { const arr = await this.getCodexEntries(); return arr.filter((e) => e.category === category); }
  async getCodexEntryById(id: string) { const arr = await this.getCodexEntries(); return arr.find((c) => c.id === id); }
  async createCodexEntry(entry: any) { entry.id = entry.id ?? randomUUID(); const arr = await this.getCodexEntries(); arr.push(entry); await this.writeFile('offline-codex.json', arr); return entry; }
  async updateCodexEntry(id: string, entry: any) { const arr = await this.getCodexEntries(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return undefined; arr[idx] = { ...arr[idx], ...entry }; await this.writeFile('offline-codex.json', arr); return arr[idx]; }
  async deleteCodexEntry(id: string) { const arr = await this.getCodexEntries(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return false; arr.splice(idx, 1); await this.writeFile('offline-codex.json', arr); return true; }

  async getBlogPosts() { return this.readFile<any[]>('offline-blog.json', []); }
  async getBlogPostBySlug(slug: string) { const arr = await this.getBlogPosts(); return arr.find((c) => c.slug === slug); }
  async getBlogPostById(id: string) { const arr = await this.getBlogPosts(); return arr.find((c) => c.id === id); }
  async createBlogPost(post: any) { post.id = post.id ?? randomUUID(); const arr = await this.getBlogPosts(); arr.push(post); await this.writeFile('offline-blog.json', arr); return post; }
  async updateBlogPost(id: string, post: any) { const arr = await this.getBlogPosts(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return undefined; arr[idx] = { ...arr[idx], ...post }; await this.writeFile('offline-blog.json', arr); return arr[idx]; }
  async deleteBlogPost(id: string) { const arr = await this.getBlogPosts(); const idx = arr.findIndex((c) => c.id === id); if (idx < 0) return false; arr.splice(idx, 1); await this.writeFile('offline-blog.json', arr); return true; }

  async getReadingProgress(sessionId: string, chapterId: string) { const arr = await this.readFile<any[]>('offline-progress.json', []); return arr.find((p) => p.sessionId === sessionId && p.chapterId === chapterId); }
  async updateReadingProgress(sessionId: string, chapterId: string, progress: number) { const arr = await this.readFile<any[]>('offline-progress.json', []); let p = arr.find((x) => x.sessionId === sessionId && x.chapterId === chapterId); if (p) { p.progress = progress; p.lastReadAt = new Date().toISOString(); } else { p = { id: randomUUID(), sessionId, chapterId, progress, lastReadAt: new Date().toISOString() }; arr.push(p); } await this.writeFile('offline-progress.json', arr); return p; }
}

let storageInstance: IStorage;
try {
  storageInstance = new DatabaseStorage();
} catch (err) {
  console.warn('DatabaseStorage initialization failed, falling back to FileStorage:', err);
  storageInstance = new FileStorage();
}

export const storage = storageInstance;
=======
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
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
