import * as schema from "@shared/schema";
<<<<<<< HEAD
import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Ensure DATABASE_URL is set, default to local sqlite file
const dbUrl = process.env.DATABASE_URL || 'file:./dev.sqlite';
console.log(`Using database at: ${dbUrl}`);

// Initialize the database connection.
// The 'file:' prefix is not needed for the better-sqlite3 constructor.
const sqliteDb = new Database(dbUrl.replace('file:', ''));

// Add a custom function to the SQLite instance for UUID generation to maintain
// compatibility with schemas that might expect it (e.g., from Postgres).
try {
  sqliteDb.function('gen_random_uuid', () => randomUUID());
} catch (e) {
  // Function might already exist, ignore the error.
  console.warn('Could not register gen_random_uuid function:', e);
}

/**
 * Ensures that the necessary tables exist in the SQLite database for local development.
 * This prevents errors when the application starts up for the first time.
 * @param dbInst - The better-sqlite3 database instance.
 */
const ensureSqliteSchema = (dbInst: any) => {
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
    );`,
  ];

  // Execute schema creation statements safely.
  dbInst.transaction((statements: string[]) => {
    for (const stmt of statements) {
      dbInst.prepare(stmt).run();
    }
  })(stmts);
  console.log('SQLite schema verified.');
};

// Run the schema setup.
try {
  ensureSqliteSchema(sqliteDb);
} catch (e) {
  console.error('Fatal: Failed to ensure SQLite schema:', e);
  process.exit(1); // Exit if the database can't be prepared.
}

// Ensure existing databases get the new 'story' column on characters table.
try {
  const cols = sqliteDb.prepare("PRAGMA table_info('characters');").all();
  const hasStory = cols.some((c: any) => c.name === 'story');
  if (!hasStory) {
    console.log("Adding missing 'story' column to characters table");
    try {
      sqliteDb.prepare("ALTER TABLE characters ADD COLUMN story TEXT;").run();
    } catch (e) {
      console.warn("Could not add 'story' column to characters table:", e);
    }
  }
  const hasSlug = cols.some((c: any) => c.name === 'slug');
  if (!hasSlug) {
    console.log("Adding missing 'slug' column to characters table");
    try {
      // Add slug column (nullable for existing rows). We'll create a unique index so future slugs are unique.
      sqliteDb.prepare("ALTER TABLE characters ADD COLUMN slug TEXT;").run();
      // Create a unique index for slug to enforce uniqueness for non-null values
      sqliteDb.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);").run();
    } catch (e) {
      console.warn("Could not add 'slug' column to characters table:", e);
    }
  }
} catch (e) {
  console.warn('Could not verify/alter characters table schema:', e);
}

// Export the Drizzle instance and the raw connection pool (the sqliteDb object).
export const db = drizzle(sqliteDb, { schema });
export const pool = sqliteDb;
=======
import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. If you have PostgreSQL locally, set DATABASE_URL=postgresql://user:pass@localhost:5432/dbname",
  );
}

let db: any = null;

if (DATABASE_URL.startsWith("postgres")) {
  const sql = postgres(DATABASE_URL, { max: 5 });
  db = drizzlePostgres(sql, { schema });
} else {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
}

export { db };
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
