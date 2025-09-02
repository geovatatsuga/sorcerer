import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const hasReplitConfig = Boolean(process.env.REPLIT_DOMAINS && process.env.REPL_ID);

const getOidcConfig = memoize(
  async () => {
    if (!hasReplitConfig) return null as any;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  // In development prefer in-memory session store to avoid hard dependency
  // on a running Postgres instance. Use PG-backed store only in production.
  let store: any = undefined;
  const conString = process.env.DATABASE_URL || undefined;
  if (process.env.NODE_ENV === 'production' && conString) {
    try {
      store = new pgStore({
        conString,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: 'sessions',
      });
    } catch (error) {
      console.warn('Failed to initialize PG session store, falling back to memory store:', error);
      store = undefined;
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
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (!hasReplitConfig) {
    // No Replit OIDC config provided — provide a simple local login form and handlers for dev.
  app.get('/api/login', (_req, res) => {
      // Simple HTML login form that posts to /api/login
      res.send(`
        <html>
          <head><title>Local Login</title></head>
          <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f7fafc;">
            <form method="POST" action="/api/login" style="background:white;padding:24px;border-radius:8px;max-width:360px;width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
              <h2 style="margin:0 0 12px;">Login (dev)</h2>
              <label style="display:block;margin-bottom:8px;">
                <div style="font-size:12px;color:#666;margin-bottom:4px;">Usuário</div>
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

    app.post('/api/login', async (req: any, res) => {
      try {
        const { username, email, password } = req.body;

        // Accept either username or email+password flow
        if (username) {
          // legacy username flow: create admin user with that id
          try {
            await storage.upsertUser({
              id: username,
              email: `${username}@local`,
              firstName: username,
              lastName: '',
              profileImageUrl: '',
              isAdmin: true,
            } as any);
          } catch (err) {
            console.warn('Could not upsert user to DB (continuing with session only):', err);
          }
          req.session.user = { id: username, email: `${username}@local`, isAdmin: true };
          return res.redirect('/admin');
        }

        if (!email || !password) {
          res.status(400).json({ message: 'email and password required' });
          return;
        }

        // Validate against dev-admins.json
        const devAdmins = JSON.parse(
          await import('fs').then((m) => m.promises.readFile(new URL('./dev-admins.json', import.meta.url), 'utf-8'))
        );
        const match = (devAdmins as any[]).find((a) => a.email === email && a.password === password);
        if (!match) {
          res.status(401).json({ message: 'Invalid credentials' });
          return;
        }

        // Upsert real user record and mark admin flag according to dev-admins.json
        const userId = email;
        try {
          await storage.upsertUser({
            id: userId,
            email,
            firstName: email.split('@')[0],
            lastName: '',
            profileImageUrl: '',
            isAdmin: !!match.isAdmin,
          } as any);
        } catch (err) {
          console.warn('Could not upsert dev admin to DB (continuing with session only):', err);
        }

        // Always store session user so auth works even without DB
        req.session.user = { id: userId, email, isAdmin: !!match.isAdmin };
        return res.redirect('/admin');
      } catch (error) {
        console.error('Local login error:', error);
        res.status(500).json({ message: 'Local login failed' });
      }
    });

    app.get('/api/logout', (req: any, res) => {
      if (req.session) {
        req.session.destroy?.(() => {});
      }
      res.redirect('/');
    });

    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // If OIDC not configured, allow all requests in local dev to simplify testing
  if (!hasReplitConfig) return next();

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
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

export const isAdmin: RequestHandler = async (req, res, next) => {
  // Allow admin actions locally when OIDC is not configured (you can secure later)
  if (!hasReplitConfig) return next();

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    (req as any).adminUser = dbUser;
    return next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};