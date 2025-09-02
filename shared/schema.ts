import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  readingTime: integer("reading_time").notNull(), // in minutes
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: text("image_url"),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  role: text("role").notNull(), // protagonist, antagonist, supporting
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  mapX: integer("map_x").notNull(), // x coordinate on map (percentage)
  mapY: integer("map_y").notNull(), // y coordinate on map (percentage)
  type: text("type").notNull(), // kingdom, forest, ruins, etc.
});

export const codexEntries = pgTable("codex_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // magic, creatures, locations
  imageUrl: text("image_url"),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(), // update, world-building, behind-scenes, research
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: text("image_url"),
});

export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id),
  sessionId: varchar("session_id").notNull(), // browser session
  progress: integer("progress").notNull().default(0), // percentage read
  lastReadAt: timestamp("last_read_at").notNull(),
});

// Insert schemas
export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertCodexEntrySchema = createInsertSchema(codexEntries).omit({
  id: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
});

// Types
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type CodexEntry = typeof codexEntries.$inferSelect;
export type InsertCodexEntry = z.infer<typeof insertCodexEntrySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
