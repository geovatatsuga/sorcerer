import * as schema from "@shared/schema";
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