var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import fs4 from "fs";
import path5 from "path";

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
import { pgTable, text, varchar, timestamp, integer, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  // Localized versions for UI content (optional)
  titleI18n: jsonb("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: jsonb("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: jsonb("excerpt_i18n"),
  chapterNumber: integer("chapter_number").notNull(),
  readingTime: integer("reading_time").notNull(),
  // in minutes
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: text("image_url")
});
var characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameI18n: jsonb("name_i18n"),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  imageUrl: text("image_url"),
  role: text("role").notNull()
  // protagonist, antagonist, supporting
});
var locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameI18n: jsonb("name_i18n"),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  mapX: integer("map_x").notNull(),
  // x coordinate on map (percentage)
  mapY: integer("map_y").notNull(),
  // y coordinate on map (percentage)
  type: text("type").notNull()
  // kingdom, forest, ruins, etc.
});
var codexEntries = pgTable("codex_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  category: text("category").notNull(),
  // magic, creatures, locations
  imageUrl: text("image_url")
});
var blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: jsonb("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: jsonb("excerpt_i18n"),
  category: text("category").notNull(),
  // update, world-building, behind-scenes, research
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: text("image_url")
});
var readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id),
  sessionId: varchar("session_id").notNull(),
  // browser session
  progress: integer("progress").notNull().default(0),
  // percentage read
  lastReadAt: timestamp("last_read_at").notNull()
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
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
var DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. If you have PostgreSQL locally, set DATABASE_URL=postgresql://user:pass@localhost:5432/dbname"
  );
}
var db = null;
if (DATABASE_URL.startsWith("postgres")) {
  const sql2 = postgres(DATABASE_URL, { max: 5 });
  db = drizzlePostgres(sql2, { schema: schema_exports });
} else {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzleNeon({ client: pool, schema: schema_exports });
}

// server/storage.ts
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
var DatabaseStorage = class {
  constructor() {
    this.seedData();
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
        updatedAt: /* @__PURE__ */ new Date()
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
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    return newChapter;
  }
  async updateChapter(id, chapter) {
    const [updatedChapter] = await db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning();
    return updatedChapter;
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
  async createCharacter(character) {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }
  async updateCharacter(id, character) {
    const [updatedCharacter] = await db.update(characters).set(character).where(eq(characters.id, id)).returning();
    return updatedCharacter;
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
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }
  async updateLocation(id, location) {
    const [updatedLocation] = await db.update(locations).set(location).where(eq(locations.id, id)).returning();
    return updatedLocation;
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
    const [newEntry] = await db.insert(codexEntries).values(entry).returning();
    return newEntry;
  }
  async updateCodexEntry(id, entry) {
    const [updatedEntry] = await db.update(codexEntries).set(entry).where(eq(codexEntries.id, id)).returning();
    return updatedEntry;
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
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }
  async updateBlogPost(id, post) {
    const [updatedPost] = await db.update(blogPosts).set(post).where(eq(blogPosts.id, id)).returning();
    return updatedPost;
  }
  async deleteBlogPost(id) {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Reading progress methods
  async getReadingProgress(sessionId, chapterId) {
    try {
      const [progress] = await db.select().from(readingProgress).where(eq(readingProgress.sessionId, sessionId)).where(eq(readingProgress.chapterId, chapterId));
      return progress;
    } catch (error) {
      console.error("DB error in getReadingProgress:", error);
      return void 0;
    }
  }
  async updateReadingProgress(sessionId, chapterId, progress) {
    try {
      const [existingProgress] = await db.update(readingProgress).set({
        progress,
        lastReadAt: /* @__PURE__ */ new Date()
      }).where(eq(readingProgress.sessionId, sessionId)).where(eq(readingProgress.chapterId, chapterId)).returning();
      if (existingProgress) {
        return existingProgress;
      }
      const [newProgress] = await db.insert(readingProgress).values({
        sessionId,
        chapterId,
        progress,
        lastReadAt: /* @__PURE__ */ new Date()
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
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3),
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      };
      const chapter2 = {
        title: "Sombras no Horizonte",
        slug: "sombras-no-horizonte",
        content: "Os ex\xE9rcitos dos Reinos do Norte se re\xFAnem enquanto press\xE1gios sombrios aparecem pelo c\xE9u. A guerra parece inevit\xE1vel...",
        excerpt: "Os ex\xE9rcitos dos Reinos do Norte se re\xFAnem enquanto press\xE1gios sombrios aparecem pelo c\xE9u. A guerra parece inevit\xE1vel...",
        chapterNumber: 14,
        readingTime: 15,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      };
      const chapter3 = {
        title: "Os Bosques Sussurrantes",
        slug: "bosques-sussurrantes",
        content: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades m\xE1gicas...",
        excerpt: "Lyanna se aventura na floresta proibida, guiada apenas por profecias antigas e suas crescentes habilidades m\xE1gicas...",
        chapterNumber: 13,
        readingTime: 18,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3),
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
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3),
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
      };
      await this.createBlogPost(blogPost1);
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
};
var LocalFileStorage = class {
  dataDir;
  constructor() {
    this.dataDir = path.resolve(process.cwd(), "data");
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
    } catch (e) {
    }
  }
  // Users
  async getUser(id) {
    try {
      const file = path.join(this.dataDir, "users.json");
      const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
      const arr = JSON.parse(data || "[]");
      return arr.find((u) => u.id === id);
    } catch (e) {
      return void 0;
    }
  }
  async upsertUser(userData) {
    const file = path.join(this.dataDir, "users.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    const arr = JSON.parse(data || "[]");
    const idx = arr.findIndex((u) => u.id === userData.id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...userData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    else arr.push({ ...userData, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    await fs.promises.writeFile(file, JSON.stringify(arr, null, 2), "utf-8");
    return userData;
  }
  // Chapters
  async getChapters() {
    const file = path.join(this.dataDir, "offline-chapters.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    return JSON.parse(data || "[]");
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
    const arr = await this.getChapters();
    const record = { id: randomUUID(), ...chapter };
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-chapters.json"), JSON.stringify(arr, null, 2), "utf-8");
    return record;
  }
  async updateChapter(id, chapter) {
    const arr = await this.getChapters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...chapter, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, "offline-chapters.json"), JSON.stringify(arr, null, 2), "utf-8");
    return arr[idx];
  }
  async deleteChapter(id) {
    const arr = await this.getChapters();
    const filtered = arr.filter((c) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-chapters.json"), JSON.stringify(filtered, null, 2), "utf-8");
    return arr.length !== filtered.length;
  }
  // Characters
  async getCharacters() {
    const file = path.join(this.dataDir, "offline-characters.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    return JSON.parse(data || "[]");
  }
  async getCharacterById(id) {
    const arr = await this.getCharacters();
    return arr.find((c) => c.id === id);
  }
  async createCharacter(character) {
    const arr = await this.getCharacters();
    const record = { id: randomUUID(), ...character };
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-characters.json"), JSON.stringify(arr, null, 2), "utf-8");
    return record;
  }
  async updateCharacter(id, character) {
    const arr = await this.getCharacters();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...character, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, "offline-characters.json"), JSON.stringify(arr, null, 2), "utf-8");
    return arr[idx];
  }
  async deleteCharacter(id) {
    const arr = await this.getCharacters();
    const filtered = arr.filter((c) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-characters.json"), JSON.stringify(filtered, null, 2), "utf-8");
    return arr.length !== filtered.length;
  }
  // Locations
  async getLocations() {
    const file = path.join(this.dataDir, "offline-locations.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    return JSON.parse(data || "[]");
  }
  async getLocationById(id) {
    const arr = await this.getLocations();
    return arr.find((c) => c.id === id);
  }
  async createLocation(location) {
    const arr = await this.getLocations();
    const record = { id: randomUUID(), ...location };
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-locations.json"), JSON.stringify(arr, null, 2), "utf-8");
    return record;
  }
  async updateLocation(id, location) {
    const arr = await this.getLocations();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...location, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, "offline-locations.json"), JSON.stringify(arr, null, 2), "utf-8");
    return arr[idx];
  }
  async deleteLocation(id) {
    const arr = await this.getLocations();
    const filtered = arr.filter((c) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-locations.json"), JSON.stringify(filtered, null, 2), "utf-8");
    return arr.length !== filtered.length;
  }
  // Codex
  async getCodexEntries() {
    const file = path.join(this.dataDir, "offline-codex.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    return JSON.parse(data || "[]");
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
    const arr = await this.getCodexEntries();
    const record = { id: randomUUID(), ...entry };
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-codex.json"), JSON.stringify(arr, null, 2), "utf-8");
    return record;
  }
  async updateCodexEntry(id, entry) {
    const arr = await this.getCodexEntries();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...entry, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, "offline-codex.json"), JSON.stringify(arr, null, 2), "utf-8");
    return arr[idx];
  }
  async deleteCodexEntry(id) {
    const arr = await this.getCodexEntries();
    const filtered = arr.filter((c) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-codex.json"), JSON.stringify(filtered, null, 2), "utf-8");
    return arr.length !== filtered.length;
  }
  // Blog
  async getBlogPosts() {
    const file = path.join(this.dataDir, "offline-blog.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    return JSON.parse(data || "[]");
  }
  async getBlogPostBySlug(slug) {
    const arr = await this.getBlogPosts();
    return arr.find((b) => b.slug === slug);
  }
  async getBlogPostById(id) {
    const arr = await this.getBlogPosts();
    return arr.find((b) => b.id === id);
  }
  async createBlogPost(post) {
    const arr = await this.getBlogPosts();
    const record = { id: randomUUID(), ...post };
    arr.push(record);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-blog.json"), JSON.stringify(arr, null, 2), "utf-8");
    return record;
  }
  async updateBlogPost(id, post) {
    const arr = await this.getBlogPosts();
    const idx = arr.findIndex((c) => c.id === id);
    if (idx < 0) return void 0;
    arr[idx] = { ...arr[idx], ...post, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await fs.promises.writeFile(path.join(this.dataDir, "offline-blog.json"), JSON.stringify(arr, null, 2), "utf-8");
    return arr[idx];
  }
  async deleteBlogPost(id) {
    const arr = await this.getBlogPosts();
    const filtered = arr.filter((c) => c.id !== id);
    await fs.promises.writeFile(path.join(this.dataDir, "offline-blog.json"), JSON.stringify(filtered, null, 2), "utf-8");
    return arr.length !== filtered.length;
  }
  // Reading progress (session-only offline)
  async getReadingProgress(sessionId, chapterId) {
    const file = path.join(this.dataDir, "offline-reading.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    const arr = JSON.parse(data || "[]");
    return arr.find((r) => r.sessionId === sessionId && r.chapterId === chapterId);
  }
  async updateReadingProgress(sessionId, chapterId, progress) {
    const file = path.join(this.dataDir, "offline-reading.json");
    const data = await fs.promises.readFile(file, "utf-8").catch(() => "[]");
    const arr = JSON.parse(data || "[]");
    const idx = arr.findIndex((r) => r.sessionId === sessionId && r.chapterId === chapterId);
    if (idx >= 0) {
      arr[idx].progress = progress;
      arr[idx].lastReadAt = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      arr.push({ sessionId, chapterId, progress, lastReadAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    await fs.promises.writeFile(file, JSON.stringify(arr, null, 2), "utf-8");
    return arr.find((r) => r.sessionId === sessionId && r.chapterId === chapterId);
  }
};
var storageImpl;
if (process.env.OFFLINE_MODE === "1") {
  storageImpl = new LocalFileStorage();
  console.log("Using LocalFileStorage (OFFLINE_MODE=1)");
} else {
  try {
    storageImpl = new DatabaseStorage();
  } catch (err) {
    console.warn("Failed to initialize DatabaseStorage, falling back to LocalFileStorage:", err);
    storageImpl = new LocalFileStorage();
  }
}
var storage = storageImpl;

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var hasReplitConfig = Boolean(process.env.REPLIT_DOMAINS && process.env.REPL_ID);
var getOidcConfig = memoize(
  async () => {
    if (!hasReplitConfig) return null;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  let store = void 0;
  const conString = process.env.DATABASE_URL || void 0;
  if (process.env.NODE_ENV === "production" && conString) {
    try {
      store = new pgStore({
        conString,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions"
      });
    } catch (error) {
      console.warn("Failed to initialize PG session store, falling back to memory store:", error);
      store = void 0;
    }
  }
  return session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  if (!hasReplitConfig) {
    app2.get("/api/login", (_req, res) => {
      res.send(`
        <html>
          <head><title>Local Login</title></head>
          <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f7fafc;">
            <form method="POST" action="/api/login" style="background:white;padding:24px;border-radius:8px;max-width:360px;width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
              <h2 style="margin:0 0 12px;">Login (dev)</h2>
              <label style="display:block;margin-bottom:8px;">
                <div style="font-size:12px;color:#666;margin-bottom:4px;">Usu\xE1rio</div>
                <input name="username" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:4px;" />
              </label>
              <label style="display:block;margin-bottom:12px;">
                <div style="font-size:12px;color:#666;margin-bottom:4px;">Senha (qualquer)</div>
                <input name="password" type="password" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:4px;" />
              </label>
              <div style="display:flex;gap:8px;justify-content:flex-end;">
                <a href="/" style="padding:8px 12px;border-radius:4px;text-decoration:none;color:#374151;border:1px solid transparent;">Cancelar</a>
                <button type="submit" style="background:#6366f1;color:white;border:none;padding:8px 12px;border-radius:4px;">Entrar</button>
              </div>
            </form>
          </body>
        </html>
      `);
    });
    app2.post("/api/login", async (req, res) => {
      try {
        const { username, email, password } = req.body;
        if (username) {
          try {
            await storage.upsertUser({
              id: username,
              email: `${username}@local`,
              firstName: username,
              lastName: "",
              profileImageUrl: "",
              isAdmin: true
            });
          } catch (err) {
            console.warn("Could not upsert user to DB (continuing with session only):", err);
          }
          req.session.user = { id: username, email: `${username}@local`, isAdmin: true };
          return res.redirect("/admin");
        }
        if (!email || !password) {
          res.status(400).json({ message: "email and password required" });
          return;
        }
        const devAdmins = JSON.parse(
          await import("fs").then((m) => m.promises.readFile(new URL("./dev-admins.json", import.meta.url), "utf-8"))
        );
        const match = devAdmins.find((a) => a.email === email && a.password === password);
        if (!match) {
          res.status(401).json({ message: "Invalid credentials" });
          return;
        }
        const userId = email;
        try {
          await storage.upsertUser({
            id: userId,
            email,
            firstName: email.split("@")[0],
            lastName: "",
            profileImageUrl: "",
            isAdmin: !!match.isAdmin
          });
        } catch (err) {
          console.warn("Could not upsert dev admin to DB (continuing with session only):", err);
        }
        req.session.user = { id: userId, email, isAdmin: !!match.isAdmin };
        return res.redirect("/admin");
      } catch (error) {
        console.error("Local login error:", error);
        res.status(500).json({ message: "Local login failed" });
      }
    });
    app2.get("/api/logout", (req, res) => {
      if (req.session) {
        req.session.destroy?.(() => {
        });
      }
      res.redirect("/");
    });
    return;
  }
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!hasReplitConfig) return next();
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
var isAdmin = async (req, res, next) => {
  if (!hasReplitConfig) return next();
  const user = req.user;
  if (!req.isAuthenticated() || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.adminUser = dbUser;
    return next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// server/routes.ts
import fs2 from "fs";
import path2 from "path";
import { randomUUID as randomUUID2 } from "crypto";
import { ZodError } from "zod";
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
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const oidcUserId = req.user?.claims?.sub;
      if (oidcUserId) {
        const user = await storage.getUser(oidcUserId);
        return res.json(user ?? null);
        app2.get("/api/locations/:id", async (req2, res2) => {
          try {
            const location = await storage.getLocationById(req2.params.id);
            if (!location) {
              res2.status(404).json({ message: "Location not found" });
              return;
            }
            res2.json(location);
          } catch (error) {
            res2.status(500).json({ message: "Failed to fetch location" });
          }
        });
      }
      const sessionUser = req.session?.user;
      if (sessionUser?.id) {
        try {
          const user = await storage.getUser(sessionUser.id);
          return res.json(user ?? sessionUser);
        } catch (err) {
          console.warn("DB unavailable when fetching user, returning session user:", err);
          return res.json(sessionUser);
        }
      }
      return res.json(null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
  app2.post("/api/admin/chapters", isAdmin, async (req, res) => {
    try {
      if (req.body?.publishedAt && typeof req.body.publishedAt === "string") {
        req.body.publishedAt = new Date(req.body.publishedAt);
      }
      const validatedData = insertChapterSchema.parse(req.body);
      try {
        const chapter = await storage.createChapter(validatedData);
        res.status(201).json(chapter);
      } catch (dbErr) {
        console.error("Create chapter DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-chapters.json");
            const record = { id: randomUUID2(), ...validatedData, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            arr.push(record);
            await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
            return res.status(201).json({ ...record, offline: true });
          } catch (fileErr) {
            console.error("Failed to save offline chapter:", fileErr);
            return res.status(500).json({ message: "Failed to create chapter (DB down and offline save failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to create chapter", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Chapter validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create chapter error:", error);
      res.status(400).json({ message: "Invalid chapter data", error: String(error) });
    }
  });
  app2.put("/api/admin/chapters/:id", isAdmin, async (req, res) => {
    try {
      if (req.body?.publishedAt && typeof req.body.publishedAt === "string") {
        req.body.publishedAt = new Date(req.body.publishedAt);
      }
      const validatedData = insertChapterSchema.partial().parse(req.body);
      try {
        const chapter = await storage.updateChapter(req.params.id, validatedData);
        if (!chapter) {
          res.status(404).json({ message: "Chapter not found" });
          return;
        }
        res.json(chapter);
      } catch (dbErr) {
        console.error("Update chapter DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-chapters.json");
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            const idx = arr.findIndex((a) => a.id === req.params.id);
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...validatedData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
              await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
              return res.json({ ...arr[idx], offline: true });
            }
            return res.status(404).json({ message: "Chapter not found (DB down, offline cache empty)" });
          } catch (fileErr) {
            console.error("Failed offline update:", fileErr);
            return res.status(500).json({ message: "Failed to update chapter (DB down and offline update failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to update chapter", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Chapter validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update chapter error:", error);
      res.status(400).json({ message: "Invalid chapter data", error: String(error) });
    }
  });
  app2.delete("/api/admin/chapters/:id", isAdmin, async (req, res) => {
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
  app2.post("/api/admin/characters", isAdmin, async (req, res) => {
    try {
      if (req.body?.nameI18n) delete req.body.nameI18n;
      const validatedData = insertCharacterSchema.parse(req.body);
      try {
        const character = await storage.createCharacter(validatedData);
        res.status(201).json(character);
      } catch (dbErr) {
        console.error("Create character DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-characters.json");
            const record = { id: randomUUID2(), ...validatedData, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            arr.push(record);
            await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
            return res.status(201).json({ ...record, offline: true });
          } catch (fileErr) {
            console.error("Failed to save offline character:", fileErr);
            return res.status(500).json({ message: "Failed to create character (DB down and offline save failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to create character", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Character validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create character error:", error);
      res.status(400).json({ message: "Invalid character data", error: String(error) });
    }
  });
  app2.put("/api/admin/characters/:id", isAdmin, async (req, res) => {
    try {
      if (req.body?.nameI18n) delete req.body.nameI18n;
      const validatedData = insertCharacterSchema.partial().parse(req.body);
      try {
        const character = await storage.updateCharacter(req.params.id, validatedData);
        if (!character) {
          res.status(404).json({ message: "Character not found" });
          return;
        }
        res.json(character);
      } catch (dbErr) {
        console.error("Update character DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-characters.json");
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            const idx = arr.findIndex((a) => a.id === req.params.id);
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...validatedData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
              await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
              return res.json({ ...arr[idx], offline: true });
            }
            return res.status(404).json({ message: "Character not found (DB down, offline cache empty)" });
          } catch (fileErr) {
            console.error("Failed offline update:", fileErr);
            return res.status(500).json({ message: "Failed to update character (DB down and offline update failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to update character", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Character validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update character error:", error);
      res.status(400).json({ message: "Invalid character data", error: String(error) });
    }
  });
  app2.delete("/api/admin/characters/:id", isAdmin, async (req, res) => {
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
  app2.post("/api/admin/locations", isAdmin, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      try {
        const location = await storage.createLocation(validatedData);
        res.status(201).json(location);
      } catch (dbErr) {
        console.error("Create location DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-locations.json");
            const record = { id: randomUUID2(), ...validatedData, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            arr.push(record);
            await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
            return res.status(201).json({ ...record, offline: true });
          } catch (fileErr) {
            console.error("Failed to save offline location:", fileErr);
            return res.status(500).json({ message: "Failed to create location (DB down and offline save failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to create location", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Location validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create location error:", error);
      res.status(400).json({ message: "Invalid location data", error: String(error) });
    }
  });
  app2.put("/api/admin/locations/:id", isAdmin, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.partial().parse(req.body);
      try {
        const location = await storage.updateLocation(req.params.id, validatedData);
        if (!location) {
          res.status(404).json({ message: "Location not found" });
          return;
        }
        res.json(location);
      } catch (dbErr) {
        console.error("Update location DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-locations.json");
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            const idx = arr.findIndex((a) => a.id === req.params.id);
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...validatedData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
              await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
              return res.json({ ...arr[idx], offline: true });
            }
            return res.status(404).json({ message: "Location not found (DB down, offline cache empty)" });
          } catch (fileErr) {
            console.error("Failed offline update:", fileErr);
            return res.status(500).json({ message: "Failed to update location (DB down and offline update failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to update location", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Location validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update location error:", error);
      res.status(400).json({ message: "Invalid location data", error: String(error) });
    }
  });
  app2.delete("/api/admin/locations/:id", isAdmin, async (req, res) => {
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
  app2.post("/api/admin/codex", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCodexEntrySchema.parse(req.body);
      try {
        const entry = await storage.createCodexEntry(validatedData);
        res.status(201).json(entry);
      } catch (dbErr) {
        console.error("Create codex entry DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-codex.json");
            const record = { id: randomUUID2(), ...validatedData, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            arr.push(record);
            await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
            return res.status(201).json({ ...record, offline: true });
          } catch (fileErr) {
            console.error("Failed to save offline codex entry:", fileErr);
            return res.status(500).json({ message: "Failed to create codex entry (DB down and offline save failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to create codex entry", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Codex validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Create codex entry error:", error);
      res.status(400).json({ message: "Invalid codex entry data", error: String(error) });
    }
  });
  app2.put("/api/admin/codex/:id", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCodexEntrySchema.partial().parse(req.body);
      try {
        const entry = await storage.updateCodexEntry(req.params.id, validatedData);
        if (!entry) {
          res.status(404).json({ message: "Codex entry not found" });
          return;
        }
        res.json(entry);
      } catch (dbErr) {
        console.error("Update codex DB error:", dbErr);
        const isDbDown = dbErr?.code === "ECONNREFUSED" || dbErr?.message && String(dbErr.message).includes("ECONNREFUSED");
        if (isDbDown) {
          try {
            const offlineDir = path2.resolve(process.cwd(), "data");
            await fs2.promises.mkdir(offlineDir, { recursive: true });
            const offlineFile = path2.join(offlineDir, "offline-codex.json");
            let arr = [];
            try {
              const existing = await fs2.promises.readFile(offlineFile, "utf-8");
              arr = JSON.parse(existing || "[]");
            } catch (e) {
              arr = [];
            }
            const idx = arr.findIndex((a) => a.id === req.params.id);
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...validatedData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
              await fs2.promises.writeFile(offlineFile, JSON.stringify(arr, null, 2), "utf-8");
              return res.json({ ...arr[idx], offline: true });
            }
            return res.status(404).json({ message: "Codex entry not found (DB down, offline cache empty)" });
          } catch (fileErr) {
            console.error("Failed offline update:", fileErr);
            return res.status(500).json({ message: "Failed to update codex entry (DB down and offline update failed)" });
          }
        }
        return res.status(500).json({ message: "Failed to update codex entry", error: String(dbErr) });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Codex validation error:", error.errors);
        return res.status(400).json({ message: "Validation failed", issues: error.errors });
      }
      console.error("Update codex entry error:", error);
      res.status(400).json({ message: "Invalid codex entry data", error: String(error) });
    }
  });
  app2.delete("/api/admin/codex/:id", isAdmin, async (req, res) => {
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
  app2.post("/api/admin/blog", isAdmin, async (req, res) => {
    try {
      if (req.body?.publishedAt && typeof req.body.publishedAt === "string") {
        req.body.publishedAt = new Date(req.body.publishedAt);
      }
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });
  app2.post("/api/admin/upload", isAdmin, async (req, res) => {
    try {
      const { filename, data } = req.body;
      if (!filename || !data) {
        res.status(400).json({ message: "filename and data (base64) are required" });
        return;
      }
      const base64 = data.includes("base64,") ? data.split("base64,")[1] : data;
      const ext = path2.extname(filename) || "";
      const name = `${randomUUID2()}${ext}`;
      const uploadsDir = path2.resolve(process.cwd(), "uploads");
      await fs2.promises.mkdir(uploadsDir, { recursive: true });
      const filePath = path2.join(uploadsDir, name);
      await fs2.promises.writeFile(filePath, Buffer.from(base64, "base64"));
      const url = `/uploads/${name}`;
      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.put("/api/admin/blog/:id", isAdmin, async (req, res) => {
    try {
      if (req.body?.publishedAt && typeof req.body.publishedAt === "string") {
        req.body.publishedAt = new Date(req.body.publishedAt);
      }
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });
  app2.delete("/api/admin/blog/:id", isAdmin, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
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
      const clientTemplate = path4.resolve(
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
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
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
  const uploadsPath = path5.resolve(process.cwd(), "uploads");
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
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
