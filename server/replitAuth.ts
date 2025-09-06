import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';

// A simplified admin check for local development that doesn't rely on sessions
export const isDevAdmin: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    (req as any).adminUser = { id: 'dev-admin', isAdmin: true };
    return next();
  }
  // Fallback to the standard isAdmin check for production
  return isAdmin(req, res, next);
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  // In development prefer a simple in-memory session store to avoid
  // attempting to connect to Postgres or rely on an existing SQLite schema.
  // MemoryStore is fine for local dev and tests.
  if (process.env.NODE_ENV === 'development') {
    const MemoryStore = session.MemoryStore;
    return session({
      store: new MemoryStore(),
      secret: process.env.SESSION_SECRET || 'dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Secure must be false for localhost HTTP
        maxAge: sessionTtl,
      },
    });
  }

  // If DATABASE_URL is provided, prefer a Postgres-backed session store in non-dev envs.
  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
      });
      return session({
        secret: process.env.SESSION_SECRET!,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: true,
          maxAge: sessionTtl,
        },
      });
    } catch (err) {
      console.warn('Postgres session store initialization failed, falling back to SQLite store:', err);
    }
  }

  // Local fallback if nothing else matched: sqlite-backed session store
  const SQLiteStore = connectSqlite3(session);
  return session({
    store: new SQLiteStore({
      db: 'dev.sqlite',
      dir: path.resolve(process.cwd()),
      table: 'sessions'
    }) as any,
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Secure must be false for localhost HTTP
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any)?.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const sessionUser = (req as any).session?.user as { id?: string; isAdmin?: boolean } | undefined;
  if (!sessionUser?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // In a simplified setup, we can trust the session flag
    if (sessionUser.isAdmin) {
      (req as any).adminUser = sessionUser;
      return next();
    }
    
    // For extra security, re-verify with the database
    const dbUser = await storage.getUser(sessionUser.id);
    if (dbUser?.isAdmin) {
      (req as any).adminUser = dbUser;
      return next();
    }
    
    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

