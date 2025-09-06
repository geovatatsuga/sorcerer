import { defineConfig } from "drizzle-kit";

// Allow local development with SQLite (dev.sqlite) while supporting POSTGRES in prod.
const url = process.env.DATABASE_URL || 'file:./dev.sqlite';
const dialect = url.startsWith('file:') || url.includes('sqlite') ? 'sqlite' : 'postgresql';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect,
  dbCredentials: {
    url,
  },
});
