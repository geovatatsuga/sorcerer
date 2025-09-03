import * as schema from "@shared/schema";
import { randomUUID } from 'crypto';

// Use top-level await so module initialization finishes before other modules import `db`.
let db: any;
let pool: any;

// Prefer local SQLite in development or when explicitly requested.
const forceLocal = process.env.FORCE_LOCAL_SQLITE === '1' || process.env.NODE_ENV === 'development';

if (process.env.DATABASE_URL && !forceLocal) {
  // Remote Neon / Postgres path
  try {
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const wsModule = await import('ws');
    const ws = wsModule.default ?? wsModule;
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    db = drizzle({ client: pool, schema });
    console.log('Using Neon/Postgres database from DATABASE_URL');
  } catch (err) {
    console.error('Error initializing Neon client:', err);
    throw err;
  }
} else {
  // Local developer fallback: SQLite using better-sqlite3 and drizzle sqlite3
  try {
    const betterSqlite3Mod = await import('better-sqlite3');
    const Database = betterSqlite3Mod.default ?? betterSqlite3Mod;
    const sqliteDb = new Database('dev.sqlite');
    // provide gen_random_uuid() for compatibility with Postgres schema defaults
    try {
      sqliteDb.function('gen_random_uuid', () => randomUUID());
    } catch (e) {
      // ignore if function cannot be registered
    }
    pool = sqliteDb;

    // Ensure minimal schema exists for local development.
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

      dbInst.exec('PRAGMA foreign_keys = OFF;');
      for (const s of stmts) dbInst.exec(s);
      dbInst.exec('PRAGMA foreign_keys = ON;');
    };

    try {
      ensureSqliteSchema(sqliteDb);
    } catch (e) {
      console.warn('Failed to ensure sqlite schema:', e);
    }

    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    db = drizzle(sqliteDb, { schema });
    console.log('Using local SQLite database at dev.sqlite');
  } catch (err) {
    console.error('Failed to initialize local SQLite fallback. Install better-sqlite3:', err);
    throw err;
  }
}

export { db, pool };