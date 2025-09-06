var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blogPosts: () => blogPosts,
  chapters: () => chapters,
  characters: () => characters,
  codexEntries: () => codexEntries,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertChapterSchema: () => insertChapterSchema,
  insertCharacterSchema: () => insertCharacterSchema,
  insertCodexEntrySchema: () => insertCodexEntrySchema,
  insertLocationSchema: () => insertLocationSchema,
  insertReadingProgressSchema: () => insertReadingProgressSchema,
  locations: () => locations,
  readingProgress: () => readingProgress,
  sessions: () => sessions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
var chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  // Localized versions for UI content (optional)
  titleI18n: text("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: text("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: text("excerpt_i18n"),
  chapterNumber: integer("chapter_number").notNull(),
  readingTime: integer("reading_time").notNull(),
  // in minutes
  publishedAt: text("published_at").notNull(),
  imageUrl: text("image_url")
});
var characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameI18n: text("name_i18n"),
  title: text("title").notNull(),
  titleI18n: text("title_i18n"),
  description: text("description").notNull(),
  story: text("story"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  role: text("role").notNull()
  // protagonist, antagonist, supporting
});
var locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameI18n: text("name_i18n"),
  description: text("description").notNull(),
  descriptionI18n: text("description_i18n"),
  mapX: integer("map_x").notNull(),
  // x coordinate on map (percentage)
  mapY: integer("map_y").notNull(),
  // y coordinate on map (percentage)
  type: text("type").notNull()
  // kingdom, forest, ruins, etc.
});
var codexEntries = sqliteTable("codex_entries", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleI18n: text("title_i18n"),
  description: text("description").notNull(),
  descriptionI18n: text("description_i18n"),
  category: text("category").notNull(),
  // magic, creatures, locations
  imageUrl: text("image_url")
});
var blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleI18n: text("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: text("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: text("excerpt_i18n"),
  category: text("category").notNull(),
  // update, world-building, behind-scenes, research
  publishedAt: text("published_at").notNull(),
  imageUrl: text("image_url")
});
var readingProgress = sqliteTable("reading_progress", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
  sessionId: text("session_id").notNull(),
  // browser session
  progress: integer("progress").notNull().default(0),
  // percentage read
  lastReadAt: text("last_read_at").notNull()
});
var insertChapterSchema = createInsertSchema(chapters).omit({
  id: true
});
var insertCharacterSchema = createInsertSchema(characters).omit({
  id: true
});
var insertLocationSchema = createInsertSchema(locations).omit({
  id: true
});
var insertCodexEntrySchema = createInsertSchema(codexEntries).omit({
  id: true
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true
});
var insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true
});
var sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: text("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  isAdmin: integer("is_admin").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at")
});

// server/db.ts
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
var dbUrl = process.env.DATABASE_URL || "file:./dev.sqlite";
console.log(`Using database at: ${dbUrl}`);
var sqliteDb = new Database(dbUrl.replace("file:", ""));
try {
  sqliteDb.function("gen_random_uuid", () => randomUUID());
} catch (e) {
  console.warn("Could not register gen_random_uuid function:", e);
}
var ensureSqliteSchema = (dbInst) => {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      reading_time INTEGER NOT NULL,
      published_at TEXT NOT NULL,
      image_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  role TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      map_x INTEGER NOT NULL,
      map_y INTEGER NOT NULL,
      type TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS codex_entries (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      category TEXT NOT NULL,
      published_at TEXT NOT NULL,
      image_url TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS reading_progress (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      last_read_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );`
  ];
  dbInst.transaction((statements) => {
    for (const stmt of statements) {
      dbInst.prepare(stmt).run();
    }
  })(stmts);
  console.log("SQLite schema verified.");
};
try {
  ensureSqliteSchema(sqliteDb);
} catch (e) {
  console.error("Fatal: Failed to ensure SQLite schema:", e);
  process.exit(1);
}
try {
  const cols = sqliteDb.prepare("PRAGMA table_info('characters');").all();
  const hasStory = cols.some((c) => c.name === "story");
  if (!hasStory) {
    console.log("Adding missing 'story' column to characters table");
    try {
      sqliteDb.prepare("ALTER TABLE characters ADD COLUMN story TEXT;").run();
    } catch (e) {
      console.warn("Could not add 'story' column to characters table:", e);
    }
  }
  const hasSlug = cols.some((c) => c.name === "slug");
  if (!hasSlug) {
    console.log("Adding missing 'slug' column to characters table");
    try {
      sqliteDb.prepare("ALTER TABLE characters ADD COLUMN slug TEXT;").run();
      sqliteDb.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);").run();
    } catch (e) {
      console.warn("Could not add 'slug' column to characters table:", e);
    }
  }
} catch (e) {
  console.warn("Could not verify/alter characters table schema:", e);
}
var db = drizzle(sqliteDb, { schema: schema_exports });

// server/storage.ts
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { randomUUID as randomUUID2 } from "crypto";
var DatabaseStorage = class {
  constructor() {
    this.seedData();
  }
  // Helper: create a filesystem-safe, url-friendly slug
  slugify(input) {
    const s = (input || "").toString().trim().toLowerCase();
    const normalized = s.normalize ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s;
    return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^[-]+|[-]+$/g, "");
  }
  // Ensure the slug is unique in `characters`. If `ignoreId` is provided, that row is excluded
  async ensureUniqueCharacterSlug(desiredSlug, ignoreId) {
    let base = this.slugify(desiredSlug) || this.slugify(desiredSlug) || "char";
    let slug = base;
    let i = 0;
    while (true) {
      const rows = await db.select().from(characters).where(eq(characters.slug, slug));
      const existing = rows.find((r) => ignoreId ? r.id !== ignoreId : true);
      if (!existing) return slug;
      i += 1;
      slug = `${base}-${i}`;
      if (i > 50) return `${base}-${Date.now()}`;
    }
  }
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }).returning();
    return user;
  }
  // Chapter methods
  async getChapters() {
    try {
      return await db.select().from(chapters).orderBy(chapters.chapterNumber);
    } catch (error) {
      console.error("DB error in getChapters:", error);
      return [];
    }
  }
  async getChapterBySlug(slug) {
    try {
      const [chapter] = await db.select().from(chapters).where(eq(chapters.slug, slug));
      return chapter;
    } catch (error) {
      console.error("DB error in getChapterBySlug:", error);
      return void 0;
    }
  }
  async getChapterById(id) {
    try {
      const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
      return chapter;
    } catch (error) {
      console.error("DB error in getChapterById:", error);
      return void 0;
    }
  }
  async createChapter(chapter) {
    const payload = { ...chapter };
    if (!payload.id) payload.id = randomUUID2();
    try {
      const [newChapter] = await db.insert(chapters).values(payload).returning();
      if (newChapter) return newChapter;
    } catch (e) {
      console.warn("Insert returning not supported or failed for chapters, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(chapters).where(eq(chapters.id, payload.id));
    if (f) return f;
    return payload;
  }
  async updateChapter(id, chapter) {
    try {
      const [updatedChapter] = await db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning();
      if (updatedChapter) return updatedChapter;
    } catch (e) {
      console.warn("Update returning not supported or failed for chapters, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(chapters).where(eq(chapters.id, id));
    return f;
  }
  async deleteChapter(id) {
    const result = await db.delete(chapters).where(eq(chapters.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Character methods
  async getCharacters() {
    try {
      return await db.select().from(characters);
    } catch (error) {
      console.error("DB error in getCharacters:", error);
      try {
        const offlineFile = path.resolve(process.cwd(), "data", "offline-characters.json");
        const data = await fs.promises.readFile(offlineFile, "utf-8");
        const arr = JSON.parse(data || "[]");
        return arr;
      } catch (fileErr) {
        return [];
      }
    }
  }
  async getCharacterById(id) {
    try {
      const [character] = await db.select().from(characters).where(eq(characters.id, id));
      return character;
    } catch (error) {
      console.error("DB error in getCharacterById:", error);
      try {
        const offlineFile = path.resolve(process.cwd(), "data", "offline-characters.json");
        const data = await fs.promises.readFile(offlineFile, "utf-8");
        const arr = JSON.parse(data || "[]");
        return arr.find((c) => c.id === id);
      } catch (fileErr) {
        return void 0;
      }
    }
  }
  async getCharacterBySlug(slug) {
    const [character] = await db.select().from(characters).where(eq(characters.slug, slug));
    return character;
  }
  async createCharacter(character) {
    const payload = { ...character };
    if (!payload.id) payload.id = randomUUID2();
    try {
      payload.slug = await this.ensureUniqueCharacterSlug(payload.slug || payload.name || payload.id);
    } catch (e) {
      payload.slug = this.slugify(payload.slug || payload.name || payload.id);
    }
    try {
      const [newCharacter] = await db.insert(characters).values(payload).returning();
      if (newCharacter) return newCharacter;
    } catch (e) {
      console.warn("Insert returning not supported or failed for characters, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(characters).where(eq(characters.id, payload.id));
    if (f) return f;
    return payload;
  }
  async updateCharacter(id, character) {
    const toUpdate = { ...character };
    if (toUpdate.slug || toUpdate.name) {
      try {
        toUpdate.slug = await this.ensureUniqueCharacterSlug(toUpdate.slug || toUpdate.name || id, id);
      } catch (e) {
        toUpdate.slug = this.slugify(toUpdate.slug || toUpdate.name || id);
      }
    }
    try {
      const [updatedCharacter] = await db.update(characters).set(toUpdate).where(eq(characters.id, id)).returning();
      if (updatedCharacter) return updatedCharacter;
    } catch (e) {
      console.warn("Update returning not supported or failed for characters, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(characters).where(eq(characters.id, id));
    return f;
  }
  async deleteCharacter(id) {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Location methods
  async getLocations() {
    try {
      return await db.select().from(locations);
    } catch (error) {
      console.error("DB error in getLocations:", error);
      try {
        const offlineFile = path.resolve(process.cwd(), "data", "offline-locations.json");
        const data = await fs.promises.readFile(offlineFile, "utf-8");
        const arr = JSON.parse(data || "[]");
        return arr;
      } catch (fileErr) {
        return [];
      }
    }
  }
  async getLocationById(id) {
    try {
      const [location] = await db.select().from(locations).where(eq(locations.id, id));
      return location;
    } catch (error) {
      console.error("DB error in getLocationById:", error);
      return void 0;
    }
  }
  async createLocation(location) {
    const payload = { ...location };
    if (!payload.id) payload.id = randomUUID2();
    try {
      const [newLocation] = await db.insert(locations).values(payload).returning();
      if (newLocation) return newLocation;
    } catch (e) {
      console.warn("Insert returning not supported or failed for locations, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(locations).where(eq(locations.id, payload.id));
    if (f) return f;
    return payload;
  }
  async updateLocation(id, location) {
    try {
      const [updatedLocation] = await db.update(locations).set(location).where(eq(locations.id, id)).returning();
      if (updatedLocation) return updatedLocation;
    } catch (e) {
      console.warn("Update returning not supported or failed for locations, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(locations).where(eq(locations.id, id));
    return f;
  }
  async deleteLocation(id) {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Codex methods
  async getCodexEntries() {
    try {
      return await db.select().from(codexEntries);
    } catch (error) {
      console.error("DB error in getCodexEntries:", error);
      try {
        const offlineFile = path.resolve(process.cwd(), "data", "offline-codex.json");
        const data = await fs.promises.readFile(offlineFile, "utf-8");
        const arr = JSON.parse(data || "[]");
        return arr;
      } catch (fileErr) {
        return [];
      }
    }
  }
  async getCodexEntriesByCategory(category) {
    try {
      return await db.select().from(codexEntries).where(eq(codexEntries.category, category));
    } catch (error) {
      console.error("DB error in getCodexEntriesByCategory:", error);
      return [];
    }
  }
  async getCodexEntryById(id) {
    try {
      const [entry] = await db.select().from(codexEntries).where(eq(codexEntries.id, id));
      return entry;
    } catch (error) {
      console.error("DB error in getCodexEntryById:", error);
      return void 0;
    }
  }
  async createCodexEntry(entry) {
    const payload = { ...entry };
    if (!payload.id) payload.id = randomUUID2();
    try {
      const [newEntry] = await db.insert(codexEntries).values(payload).returning();
      if (newEntry) return newEntry;
    } catch (e) {
      console.warn("Insert returning not supported or failed for codex entries, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(codexEntries).where(eq(codexEntries.id, payload.id));
    if (f) return f;
    return payload;
  }
  async updateCodexEntry(id, entry) {
    try {
      const [updatedEntry] = await db.update(codexEntries).set(entry).where(eq(codexEntries.id, id)).returning();
      if (updatedEntry) return updatedEntry;
    } catch (e) {
      console.warn("Update returning not supported or failed for codex entries, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(codexEntries).where(eq(codexEntries.id, id));
    return f;
  }
  async deleteCodexEntry(id) {
    const result = await db.delete(codexEntries).where(eq(codexEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Blog methods
  async getBlogPosts() {
    try {
      return await db.select().from(blogPosts).orderBy(blogPosts.publishedAt);
    } catch (error) {
      console.error("DB error in getBlogPosts:", error);
      return [];
    }
  }
  async getBlogPostBySlug(slug) {
    try {
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
      return post;
    } catch (error) {
      console.error("DB error in getBlogPostBySlug:", error);
      return void 0;
    }
  }
  async getBlogPostById(id) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  async createBlogPost(post) {
    const payload = { ...post };
    if (!payload.id) payload.id = randomUUID2();
    try {
      payload.slug = await this.ensureUniqueCharacterSlug(payload.slug || payload.title || payload.id);
    } catch (e) {
      payload.slug = this.slugify(payload.slug || payload.title || payload.id);
    }
    try {
      const [newPost] = await db.insert(blogPosts).values(payload).returning();
      if (newPost) return newPost;
    } catch (e) {
      console.warn("Insert returning not supported or failed for blog posts, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(blogPosts).where(eq(blogPosts.id, payload.id));
    if (f) return f;
    return payload;
  }
  async updateBlogPost(id, post) {
    const toUpdate = { ...post };
    if (toUpdate.slug || toUpdate.title) {
      try {
        toUpdate.slug = await this.ensureUniqueCharacterSlug(toUpdate.slug || toUpdate.title || id, id);
      } catch (e) {
        toUpdate.slug = this.slugify(toUpdate.slug || toUpdate.title || id);
      }
    }
    try {
      const [updatedPost] = await db.update(blogPosts).set(toUpdate).where(eq(blogPosts.id, id)).returning();
      if (updatedPost) return updatedPost;
    } catch (e) {
      console.warn("Update returning not supported or failed for blog posts, falling back to SELECT:", e);
    }
    const [f] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return f;
  }
  async deleteBlogPost(id) {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Reading progress methods
  async getReadingProgress(sessionId, chapterId) {
    const [progress] = await db.select().from(readingProgress).where(and(eq(readingProgress.sessionId, sessionId), eq(readingProgress.chapterId, chapterId)));
    return progress;
  }
  async updateReadingProgress(sessionId, chapterId, progress) {
    try {
      const [existingProgress] = await db.update(readingProgress).set({
        progress,
        lastReadAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(and(eq(readingProgress.sessionId, sessionId), eq(readingProgress.chapterId, chapterId))).returning();
      if (existingProgress) {
        return existingProgress;
      }
      const [newProgress] = await db.insert(readingProgress).values({
        sessionId,
        chapterId,
        progress,
        lastReadAt: (/* @__PURE__ */ new Date()).toISOString()
      }).returning();
      return newProgress;
    } catch (error) {
      console.error("DB error in updateReadingProgress:", error);
      throw error;
    }
  }
  async seedData() {
    try {
      const existingChapters = await this.getChapters();
      if (existingChapters.length > 0) {
        return;
      }
      const chapter1 = {
        title: "O Despertar dos Poderes Antigos",
        slug: "despertar-poderes-antigos",
        content: `As brumas do tempo se separaram como cortinas antigas, revelando um mundo que Eldric mal reconhecia. Onde antes a Grande Espiral de Luminar perfurava os c\xE9us, agora apenas ru\xEDnas permaneciam, tomadas por vinhas espinhosas que pulsavam com escurid\xE3o antinatural.

Ele deu um passo \xE0 frente, suas botas desgastadas esmagando fragmentos cristalinos que antes eram janelas para outros reinos. Tr\xEAs s\xE9culos. Era esse o tempo que ele havia ficado selado no Vazio Entre Mundos, e em sua aus\xEAncia, tudo o que ele havia lutado para proteger havia desmoronado.

"Os selos est\xE3o quebrados", ele sussurrou, sua voz carregando poder que fez o pr\xF3prio ar tremer. Atr\xE1s dele, a realidade se curvou e torceu conforme sua aura m\xE1gica despertava ap\xF3s seu longo sono. "E a escurid\xE3o criou ra\xEDzes onde a luz antes floresceu."

O Primeiro Feiticeiro havia retornado, mas o mundo que ele conhecia se foi para sempre. Em seu lugar estava um reino consumido pelas sombras, onde o pr\xF3prio tecido da magia havia sido corrompido. Ainda assim, dentro dessa corrup\xE7\xE3o, Eldric sentiu algo mais - uma presen\xE7a familiar, antiga e mal\xE9vola.

"Malachar", ele suspirou, o nome tendo gosto de cinzas em sua l\xEDngua. Seu antigo aprendiz, aquele em quem havia confiado acima de todos os outros, aquele cuja trai\xE7\xE3o havia levado ao seu aprisionamento. O Rei das Sombras n\xE3o apenas havia sobrevivido aos s\xE9culos; ele havia prosperado.`,
        excerpt: "Eldric descobre a c\xE2mara oculta sob a Grande Biblioteca, onde os primeiros feiti\xE7os j\xE1 escritos ainda pulsam com energia adormecida...",
        chapterNumber: 15,
        readingTime: 12,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      };
      const chapter2 = {
        title: "Sombras no Horizonte",
        slug: "sombras-no-horizonte",
        content: "Os ex\xE9rcitos dos Reinos do Norte se re\xFAnem enquanto press\xE1gios sombrios aparecem pelo c\xE9u. A guerra parece inevit\xE1vel...",
        excerpt: "Os ex\xE9rcitos dos Reinos do Norte se re\xFAnem enquanto press\xE1gios sombrios aparecem pelo c\xE9u. A guerra parece inevit\xE1vel...",
        chapterNumber: 14,
        readingTime: 15,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      };
      const chapter3 = {
        title: "Os Bosques Sussurrantes",
        slug: "bosques-sussurrantes",
        content: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades m\xE1gicas...",
        excerpt: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades m\xE1gicas...",
        chapterNumber: 13,
        readingTime: 18,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      };
      await this.createChapter(chapter1);
      await this.createChapter(chapter2);
      await this.createChapter(chapter3);
      const aslam = {
        name: "Aslam Arianthe",
        title: "O Primeiro Feiticeiro",
        description: "Antigo e poderoso, Aslam retorna ap\xF3s s\xE9culos para encontrar seu mundo transformado pela guerra e escurid\xE3o. Gentil e compassivo, apesar de seu poder imenso, carrega uma solid\xE3o por ser 'diferente'.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "protagonist"
      };
      const lyra = {
        name: "Lyra Stormweaver",
        title: "Conjuradora de Tempestades",
        description: "Uma jovem maga com cabelos negros e t\xFAnica azul adornada com runas antigas. Seus olhos brilhantes sugerem suas habilidades m\xE1gicas, determinada mas tensa.",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "protagonist"
      };
      const aldrich = {
        name: "Lorde Aldrich Sylvaris",
        title: "Cabe\xE7a da Casa Sylvaris",
        description: "Senhor imponente de tom \xE9bano profundo e cabelo raspado com barba cheia. L\xEDder da poderosa Casa Sylvaris, com 46 anos e n\xEDvel de anel de mana 3.1.",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "supporting"
      };
      const kellen = {
        name: "Kellen Aurelio",
        title: "Guerreiro Experiente",
        description: "Alto e musculoso, com cabelos negros e olhos intensos. Veste uma armadura marcada por batalhas que contam hist\xF3rias de combates passados.",
        imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        role: "supporting"
      };
      await this.createCharacter(aslam);
      await this.createCharacter(lyra);
      await this.createCharacter(aldrich);
      await this.createCharacter(kellen);
      const valaria = {
        name: "Reino de Valaria",
        description: "Capital pr\xF3spera onde residem nobres e artes\xE3os. Centro pol\xEDtico e cultural com arquitetura majestosa.",
        mapX: 33,
        mapY: 25,
        type: "capital"
      };
      const aethermoor = {
        name: "Cidade Flutuante de Aethermoor",
        description: "Maravilha da engenharia m\xE1gica, suspensa no ar por cristais encantados. Centro de conhecimento arcano.",
        mapX: 75,
        mapY: 50,
        type: "forest"
      };
      const monteNuvens = {
        name: "Monte Nuvens",
        description: "Montanha imponente onde o vento sopra forte e os picos tocam as nuvens. Local de poder e mist\xE9rio.",
        mapX: 25,
        mapY: 67,
        type: "shadowlands"
      };
      await this.createLocation(valaria);
      await this.createLocation(aethermoor);
      await this.createLocation(monteNuvens);
      const blogPost1 = {
        title: "Criando os Sistemas M\xE1gicos de Aethermoor",
        slug: "criando-sistemas-magicos",
        content: "Mergulhe na inspira\xE7\xE3o e pesquisa por tr\xE1s do complexo framework m\xE1gico que alimenta esta \xE9pica narrativa. Exploramos como os An\xE9is de Mana funcionam e como diferentes n\xEDveis determinam o poder dos feiticeiros...",
        excerpt: "Mergulhe na inspira\xE7\xE3o e pesquisa por tr\xE1s do complexo framework m\xE1gico que alimenta esta \xE9pica narrativa...",
        category: "constru\xE7\xE3o-de-mundo",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
      };
      await this.createBlogPost(blogPost1);
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
};
var FileStorage = class {
  baseDir = path.resolve(process.cwd(), "data");
  constructor() {
    fs.mkdirSync(this.baseDir, { recursive: true });
  }
  // helper
  async readFile(name, defaultValue) {
    const fp = path.join(this.baseDir, name);
    try {
      const txt = await fs.promises.readFile(fp, "utf-8");
      return JSON.parse(txt || "null");
    } catch (e) {
      return defaultValue;
    }
  }
  async writeFile(name, data) {
    const fp = path.join(this.baseDir, name);
    await fs.promises.writeFile(fp, JSON.stringify(data, null, 2), "utf-8");
  }
  async getUser(id) {
    const users2 = await this.readFile("offline-users.json", []);
    return users2.find((u) => u.id === id);
  }
  async upsertUser(user) {
    const users2 = await this.readFile("offline-users.json", []);
    const idx = users2.findIndex((u) => u.id === user.id);
    if (idx >= 0) users2[idx] = { ...users2[idx], ...user };
    else users2.push(user);
    await this.writeFile("offline-users.json", users2);
    return users2.find((u) => u.id === user.id);
  }
  async getChapters() {
    return this.readFile("offline-chapters.json", []);
  }
  async getChapterBySlug(slug) {
    const arr = await this.getChapters();
    return arr.find((c) => c.slug === slug);
  }
  async getChapterById(id) {
    const arr = await this.getChapters();
    return arr.find((c) => c.id === id);
  }
  async createChapter(chapter) {
    chapter.id = chapter.id ?? randomUUID2();
    const arr = await this.getChapters();
    arr.push(chapter);
    await this.writeFile("offline-chapters.json", arr);
    return chapter;
  }
  async updateChapter(id, chapter) {
    const arr = await this.getChapters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...chapter };
    await this.writeFile("offline-chapters.json", arr);
    return arr[idx];
  }
  async deleteChapter(id) {
    const arr = await this.getChapters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    await this.writeFile("offline-chapters.json", arr);
    return true;
  }
  async getCharacters() {
    return this.readFile("offline-characters.json", []);
  }
  async getCharacterById(id) {
    const arr = await this.getCharacters();
    return arr.find((c) => c.id === id);
  }
  async getCharacterBySlug(slug) {
    const arr = await this.getCharacters();
    return arr.find((c) => c.slug === slug);
  }
  async createCharacter(character) {
    character.id = character.id ?? randomUUID2();
    const arr = await this.getCharacters();
    arr.push(character);
    await this.writeFile("offline-characters.json", arr);
    return character;
  }
  async updateCharacter(id, character) {
    const arr = await this.getCharacters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...character };
    await this.writeFile("offline-characters.json", arr);
    return arr[idx];
  }
  async deleteCharacter(id) {
    const arr = await this.getCharacters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    await this.writeFile("offline-characters.json", arr);
    return true;
  }
  async getLocations() {
    return this.readFile("offline-locations.json", []);
  }
  async getLocationById(id) {
    const arr = await this.getLocations();
    return arr.find((c) => c.id === id);
  }
  async createLocation(location) {
    location.id = location.id ?? randomUUID2();
    const arr = await this.getLocations();
    arr.push(location);
    await this.writeFile("offline-locations.json", arr);
    return location;
  }
  async updateLocation(id, location) {
    const arr = await this.getLocations();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...location };
    await this.writeFile("offline-locations.json", arr);
    return arr[idx];
  }
  async deleteLocation(id) {
    const arr = await this.getLocations();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    await this.writeFile("offline-locations.json", arr);
    return true;
  }
  async getCodexEntries() {
    return this.readFile("offline-codex.json", []);
  }
  async getCodexEntriesByCategory(category) {
    const arr = await this.getCodexEntries();
    return arr.filter((e) => e.category === category);
  }
  async getCodexEntryById(id) {
    const arr = await this.getCodexEntries();
    return arr.find((c) => c.id === id);
  }
  async createCodexEntry(entry) {
    entry.id = entry.id ?? randomUUID2();
    const arr = await this.getCodexEntries();
    arr.push(entry);
    await this.writeFile("offline-codex.json", arr);
    return entry;
  }
  async updateCodexEntry(id, entry) {
    const arr = await this.getCodexEntries();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...entry };
    await this.writeFile("offline-codex.json", arr);
    return arr[idx];
  }
  async deleteCodexEntry(id) {
    const arr = await this.getCodexEntries();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    await this.writeFile("offline-codex.json", arr);
    return true;
  }
  async getBlogPosts() {
    return this.readFile("offline-blog.json", []);
  }
  async getBlogPostBySlug(slug) {
    const arr = await this.getBlogPosts();
    return arr.find((c) => c.slug === slug);
  }
  async getBlogPostById(id) {
    const arr = await this.getBlogPosts();
    return arr.find((c) => c.id === id);
  }
  async createBlogPost(post) {
    post.id = post.id ?? randomUUID2();
    const arr = await this.getBlogPosts();
    arr.push(post);
    await this.writeFile("offline-blog.json", arr);
    return post;
  }
  async updateBlogPost(id, post) {
    const arr = await this.getBlogPosts();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...post };
    await this.writeFile("offline-blog.json", arr);
    return arr[idx];
  }
  async deleteBlogPost(id) {
    const arr = await this.getBlogPosts();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    await this.writeFile("offline-blog.json", arr);
    return true;
  }
  async getReadingProgress(sessionId, chapterId) {
    const arr = await this.readFile("offline-progress.json", []);
    return arr.find((p) => p.sessionId === sessionId && p.chapterId === chapterId);
  }
  async updateReadingProgress(sessionId, chapterId, progress) {
    const arr = await this.readFile("offline-progress.json", []);
    let p = arr.find((x) => x.sessionId === sessionId && x.chapterId === chapterId);
    if (p) {
      p.progress = progress;
      p.lastReadAt = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      p = { id: randomUUID2(), sessionId, chapterId, progress, lastReadAt: (/* @__PURE__ */ new Date()).toISOString() };
      arr.push(p);
    }
    await this.writeFile("offline-progress.json", arr);
    return p;
  }
};
var storageInstance;
try {
  storageInstance = new DatabaseStorage();
} catch (err) {
  console.warn("DatabaseStorage initialization failed, falling back to FileStorage:", err);
  storageInstance = new FileStorage();
}
var storage = storageInstance;

// server/replitAuth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
import connectSqlite3 from "connect-sqlite3";
import path2 from "path";
var isDevAdmin = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    req.adminUser = { id: "dev-admin", isAdmin: true };
    return next();
  }
  return isAdmin(req, res, next);
};
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  if (process.env.NODE_ENV === "development") {
    const MemoryStore = session.MemoryStore;
    return session({
      store: new MemoryStore(),
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        // Secure must be false for localhost HTTP
        maxAge: sessionTtl
      }
    });
  }
  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions"
      });
      return session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: true,
          maxAge: sessionTtl
        }
      });
    } catch (err) {
      console.warn("Postgres session store initialization failed, falling back to SQLite store:", err);
    }
  }
  const SQLiteStore = connectSqlite3(session);
  return session({
    store: new SQLiteStore({
      db: "dev.sqlite",
      dir: path2.resolve(process.cwd()),
      table: "sessions"
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      // Secure must be false for localhost HTTP
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
}
var isAdmin = async (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if (sessionUser.isAdmin) {
      req.adminUser = sessionUser;
      return next();
    }
    const dbUser = await storage.getUser(sessionUser.id);
    if (dbUser?.isAdmin) {
      req.adminUser = dbUser;
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// server/routes.ts
import fs2 from "fs";
import path3 from "path";
import { randomUUID as randomUUID3 } from "crypto";
import { ZodError } from "zod";
async function saveTranslations(_resource, _id, _translations) {
  return;
}
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/codex/:id", async (req, res) => {
    try {
      const entry = await storage.getCodexEntryById(req.params.id);
      if (!entry) {
        res.status(404).json({ message: "Codex entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch codex entry" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = req.session?.user || null;
      return res.json(sessionUser);
    } catch (err) {
      console.error("Auth user error:", err);
      return res.status(500).json({ message: "Failed to get user info" });
    }
  });
  app2.get("/api/chapters", async (req, res) => {
    try {
      const chapters2 = await storage.getChapters();
      res.json(chapters2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });
  app2.get("/api/chapters/:slug", async (req, res) => {
    try {
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        res.status(404).json({ message: "Chapter not found" });
        return;
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });
  app2.get("/api/characters", async (req, res) => {
    try {
      const characters2 = await storage.getCharacters();
      res.json(characters2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });
  app2.get("/api/characters/slug/:slug", async (req, res) => {
    try {
      const character = await storage.getCharacterBySlug(req.params.slug);
      if (!character) {
        res.status(404).json({ message: "Character not found" });
        return;
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character by slug" });
    }
  });
  app2.get("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.getCharacterById(req.params.id);
      if (!character) {
        res.status(404).json({ message: "Character not found" });
        return;
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });
  app2.get("/api/locations", async (req, res) => {
    try {
      const locations2 = await storage.getLocations();
      res.json(locations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  app2.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocationById(req.params.id);
      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });
  app2.get("/api/codex", async (req, res) => {
    try {
      const { category } = req.query;
      const entries = category ? await storage.getCodexEntriesByCategory(category) : await storage.getCodexEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch codex entries" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  app2.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  app2.get("/api/reading-progress/:sessionId/:chapterId", async (req, res) => {
    try {
      const { sessionId, chapterId } = req.params;
      const progress = await storage.getReadingProgress(sessionId, chapterId);
      if (!progress) {
        res.status(404).json({ message: "No reading progress found" });
        return;
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading progress" });
    }
  });
  app2.put("/api/reading-progress", async (req, res) => {
    try {
      const { sessionId, chapterId, progress } = req.body;
      if (!sessionId || !chapterId || typeof progress !== "number") {
        res.status(400).json({ message: "Missing sessionId, chapterId or progress" });
        return;
      }
      const updatedProgress = await storage.updateReadingProgress(sessionId, chapterId, progress);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Reading progress error:", error);
      res.status(400).json({ message: "Invalid reading progress data" });
    }
  });
  app2.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        res.status(400).json({ message: "Valid email address required" });
        return;
      }
      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });
  app2.post("/api/translate", async (_req, res) => {
    return res.status(501).json({ message: "Translation provider disabled" });
  });
  app2.post("/api/admin/chapters", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" and "translations" properties' });
      if (!data.title) {
        const fallbackTitle = data.slug || "Untitled Chapter";
        console.warn("Chapter payload missing title, defaulting to:", fallbackTitle);
        data.title = fallbackTitle;
      }
      if (!data.excerpt) {
        if (typeof data.content === "string" && data.content.length > 0) {
          data.excerpt = String(data.content).slice(0, 200);
          console.warn("Chapter payload missing excerpt, deriving from content (200 chars)");
        } else {
          data.excerpt = "";
        }
      }
      const validatedData = insertChapterSchema.parse(data);
      const chapter = await storage.createChapter(validatedData);
      if (chapter?.id && translations) {
        await saveTranslations("chapters", chapter.id, translations);
      }
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Chapter validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create chapter error:", error);
      res.status(500).json({ message: "Failed to create chapter", error: String(error) });
    }
  });
  app2.put("/api/admin/chapters/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertChapterSchema.partial().parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const chapter = await storage.updateChapter(req.params.id, validatedData);
      if (!chapter) {
        res.status(404).json({ message: "Chapter not found" });
        return;
      }
      if (chapter?.id && translations) {
        await saveTranslations("chapters", chapter.id, translations);
      }
      res.json(chapter);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Chapter validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update chapter error:", error);
      res.status(500).json({ message: "Failed to update chapter", error: String(error) });
    }
  });
  app2.delete("/api/admin/chapters/:id", isDevAdmin, async (req, res) => {
    try {
      const success = await storage.deleteChapter(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Chapter not found" });
        return;
      }
      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      console.error("Delete chapter error:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });
  app2.post("/api/admin/characters", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      try {
        console.log("ADMIN CREATE CHARACTER translations keys:", translations ? Object.keys(translations) : "(none)", "translations sample:", translations ? Object.keys(translations).slice(0, 3).reduce((acc, k) => ({ ...acc, [k]: Object.keys(translations[k] || {}).slice(0, 3) }), {}) : null);
      } catch (e) {
      }
      const validatedData = insertCharacterSchema.parse(data);
      const character = await storage.createCharacter(validatedData);
      if (character?.id && translations) {
        await saveTranslations("characters", character.id, translations);
      }
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Character validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create character error:", error);
      res.status(500).json({ message: "Failed to create character", error: String(error) });
    }
  });
  app2.put("/api/admin/characters/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      try {
        console.log("ADMIN UPDATE CHARACTER id=", req.params.id, "translations keys:", translations ? Object.keys(translations) : "(none)", "translations sample:", translations ? Object.keys(translations).slice(0, 3).reduce((acc, k) => ({ ...acc, [k]: Object.keys(translations[k] || {}).slice(0, 3) }), {}) : null);
      } catch (e) {
      }
      const validatedData = insertCharacterSchema.partial().parse(data);
      const character = await storage.updateCharacter(req.params.id, validatedData);
      if (!character) {
        res.status(404).json({ message: "Character not found" });
        return;
      }
      if (character?.id && translations) {
        await saveTranslations("characters", character.id, translations);
      }
      res.json(character);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Character validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update character error:", error);
      res.status(500).json({ message: "Failed to update character", error: String(error) });
    }
  });
  app2.delete("/api/admin/characters/:id", isDevAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCharacter(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Character not found" });
        return;
      }
      res.json({ message: "Character deleted successfully" });
    } catch (error) {
      console.error("Delete character error:", error);
      res.status(500).json({ message: "Failed to delete character" });
    }
  });
  app2.post("/api/admin/locations", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertLocationSchema.parse(data);
      const location = await storage.createLocation(validatedData);
      if (location?.id && translations) {
        await saveTranslations("locations", location.id, translations);
      }
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Location validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location", error: String(error) });
    }
  });
  app2.put("/api/admin/locations/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertLocationSchema.partial().parse(data);
      const location = await storage.updateLocation(req.params.id, validatedData);
      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }
      if (location?.id && translations) {
        await saveTranslations("locations", location.id, translations);
      }
      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Location validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update location error:", error);
      res.status(500).json({ message: "Failed to update location", error: String(error) });
    }
  });
  app2.delete("/api/admin/locations/:id", isDevAdmin, async (req, res) => {
    try {
      const success = await storage.deleteLocation(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Location not found" });
        return;
      }
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      console.error("Delete location error:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });
  app2.post("/api/admin/codex", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertCodexEntrySchema.parse(data);
      const entry = await storage.createCodexEntry(validatedData);
      if (entry?.id && translations) {
        await saveTranslations("codex", entry.id, translations);
      }
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Codex validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create codex entry error:", error);
      res.status(500).json({ message: "Failed to create codex entry", error: String(error) });
    }
  });
  app2.put("/api/admin/codex/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertCodexEntrySchema.partial().parse(data);
      const entry = await storage.updateCodexEntry(req.params.id, validatedData);
      if (!entry) {
        res.status(404).json({ message: "Codex entry not found" });
        return;
      }
      if (entry?.id && translations) {
        await saveTranslations("codex", entry.id, translations);
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Codex validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update codex entry error:", error);
      res.status(500).json({ message: "Failed to update codex entry", error: String(error) });
    }
  });
  app2.delete("/api/admin/codex/:id", isDevAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCodexEntry(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Codex entry not found" });
        return;
      }
      res.json({ message: "Codex entry deleted successfully" });
    } catch (error) {
      console.error("Delete codex entry error:", error);
      res.status(500).json({ message: "Failed to delete codex entry" });
    }
  });
  app2.post("/api/admin/blog", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertBlogPostSchema.parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const post = await storage.createBlogPost(validatedData);
      if (post?.id && translations) {
        await saveTranslations("blog", post.id, translations);
      }
      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data", error: String(error) });
    }
  });
  app2.post("/api/admin/upload", isDevAdmin, async (req, res) => {
    try {
      const { filename, data } = req.body;
      if (!filename || !data) {
        res.status(400).json({ message: "filename and data (base64) are required" });
        return;
      }
      const base64 = data.includes("base64,") ? data.split("base64,")[1] : data;
      const ext = path3.extname(filename) || "";
      const name = `${randomUUID3()}${ext}`;
      const uploadsDir = path3.resolve(process.cwd(), "uploads");
      await fs2.promises.mkdir(uploadsDir, { recursive: true });
      const filePath = path3.join(uploadsDir, name);
      await fs2.promises.writeFile(filePath, Buffer.from(base64, "base64"));
      const url = `/uploads/${name}`;
      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.put("/api/admin/blog/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });
      const validatedData = insertBlogPostSchema.partial().parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }
      if (post?.id && translations) {
        await saveTranslations("blog", post.id, translations);
      }
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data", error: String(error) });
    }
  });
  app2.delete("/api/admin/blog/:id", isDevAdmin, async (req, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  if (process.env.NODE_ENV === "development") {
    app2.post("/api/dev/login", (req, res) => {
      try {
        const { id, email, isAdmin: isAdmin3 = true } = req.body || {};
        if (!id) return res.status(400).json({ message: "id is required" });
        req.session.user = { id, email: email ?? `${id}@local.dev`, isAdmin: isAdmin3 };
        return res.json({ ok: true, user: req.session.user });
      } catch (error) {
        console.error("Dev login error:", error);
        return res.status(500).json({ message: "Failed to login (dev)" });
      }
    });
    app2.get("/api/dev/login", (req, res) => {
      try {
        req.session.user = {
          id: "dev-admin",
          email: "dev-admin@local.dev",
          isAdmin: true
        };
        return res.redirect("/#/admin");
      } catch (error) {
        console.error("Dev admin error:", error);
        return res.status(500).json({ message: "Failed to access admin (dev)" });
      }
    });
    app2.post("/api/dev/create-admin", async (req, res) => {
      try {
        const { id = `dev-${randomUUID3()}`, email, displayName, isAdmin: isAdmin3 = true } = req.body || {};
        const userRecord = await storage.upsertUser({
          id,
          email: email ?? `${id}@local.dev`,
          firstName: displayName ?? "Dev",
          lastName: "",
          profileImageUrl: void 0,
          isAdmin: !!isAdmin3
        });
        return res.json({ ok: true, user: userRecord });
      } catch (error) {
        console.error("Dev create-admin error:", error);
        return res.status(500).json({ message: "Failed to create admin user" });
      }
    });
    app2.get("/api/dev/debug", (req, res) => {
      try {
        const sessionUser = req.session?.user || null;
        const info = {
          sessionUser,
          headers: {
            host: req.headers.host,
            origin: req.headers.origin,
            referer: req.headers.referer,
            cookie: req.headers.cookie,
            ua: req.headers["user-agent"],
            forwarded: req.headers["x-forwarded-for"] || null
          },
          url: req.originalUrl
        };
        return res.json(info);
      } catch (err) {
        console.error("Dev debug error:", err);
        return res.status(500).json({ message: "Dev debug failed" });
      }
    });
    app2.get("/api/dev/translations/:resource/:id", async (req, res) => {
      return res.json({ ok: true, translation: null });
    });
    app2.post("/api/dev/translations/:resource/:id", async (req, res) => {
      return res.json({ ok: true });
    });
  }
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path5 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path4.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path5.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import fs4 from "fs";
import path6 from "path";
var app = express2();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    // Allow requests from the Vite dev server
    credentials: true
    // Allow cookies to be sent
  })
);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path7 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path7.startsWith("/api")) {
      let logLine = `${req.method} ${path7} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(status).json({ message });
    } else {
      console.warn("Error after headers sent:", message);
    }
    console.error(err);
  });
  const uploadsPath = path6.resolve(process.cwd(), "uploads");
  if (!fs4.existsSync(uploadsPath)) {
    fs4.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use("/uploads", express2.static(uploadsPath));
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
