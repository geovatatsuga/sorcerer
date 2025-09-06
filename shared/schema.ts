import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  // Localized versions for UI content (optional)
  titleI18n: jsonb("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: jsonb("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: jsonb("excerpt_i18n"),
  chapterNumber: integer("chapter_number").notNull(),
  readingTime: integer("reading_time").notNull(), // in minutes
  publishedAt: text("published_at").notNull(),
  imageUrl: text("image_url"),
});

export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameI18n: jsonb("name_i18n"),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  description: text("description").notNull(),
<<<<<<< HEAD
  story: text("story"),
  slug: text("slug").notNull().unique(),
=======
  descriptionI18n: jsonb("description_i18n"),
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
  imageUrl: text("image_url"),
  role: text("role").notNull(), // protagonist, antagonist, supporting
});

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameI18n: jsonb("name_i18n"),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  mapX: integer("map_x").notNull(), // x coordinate on map (percentage)
  mapY: integer("map_y").notNull(), // y coordinate on map (percentage)
  type: text("type").notNull(), // kingdom, forest, ruins, etc.
});

export const codexEntries = sqliteTable("codex_entries", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n"),
  category: text("category").notNull(), // magic, creatures, locations
  imageUrl: text("image_url"),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleI18n: jsonb("title_i18n"),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentI18n: jsonb("content_i18n"),
  excerpt: text("excerpt").notNull(),
  excerptI18n: jsonb("excerpt_i18n"),
  category: text("category").notNull(), // update, world-building, behind-scenes, research
  publishedAt: text("published_at").notNull(),
  imageUrl: text("image_url"),
});

export const readingProgress = sqliteTable("reading_progress", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
  sessionId: text("session_id").notNull(), // browser session
  progress: integer("progress").notNull().default(0), // percentage read
  lastReadAt: text("last_read_at").notNull(),
});

// Insert schemas
export const insertChapterSchema = ((createInsertSchema(chapters) as any).omit({
  id: true,
}) as any);

export const insertCharacterSchema = ((createInsertSchema(characters) as any).omit({
  id: true,
}) as any);

export const insertLocationSchema = ((createInsertSchema(locations) as any).omit({
  id: true,
}) as any);

export const insertCodexEntrySchema = ((createInsertSchema(codexEntries) as any).omit({
  id: true,
}) as any);

export const insertBlogPostSchema = ((createInsertSchema(blogPosts) as any).omit({
  id: true,
}) as any);

export const insertReadingProgressSchema = ((createInsertSchema(readingProgress) as any).omit({
  id: true,
}) as any);

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
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: text("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  isAdmin: integer("is_admin").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
