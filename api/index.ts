// MUST be first - force IPv4 DNS before any network modules load
import '../server/ipv4-first';
import '../server/env';
import '../server/insecureTls';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { registerRoutes } from '../server/routes';
import { dbInit } from '../server/db';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(compression({ threshold: 0 }));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  const noStore = () => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  };

  const alwaysNoStorePrefixes = [
    '/api/auth', '/api/login', '/api/logout', '/api/user', '/api/dev', '/api/admin'
  ];
  if (alwaysNoStorePrefixes.some(p => req.path.startsWith(p)) || req.method !== 'GET') {
    noStore();
    return next();
  }

  const cacheablePattern = /^\/api\/(chapters|characters|locations|codex|blog|maps)(\/|$)/;
  if (cacheablePattern.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.setHeader('Vary', 'Accept-Encoding');
  } else {
    noStore();
  }
  next();
});

app.use(express.json({ limit: process.env.BODY_LIMIT || '25mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '25mb' }));

let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInit() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await dbInit().catch((e) => {
        console.warn('Vercel serverless DB init failed (fallback will continue):', e?.message || e);
      });
      await registerRoutes(app);

      // Hero rotativas API endpoint for serverless
      app.get('/api/hero-rotativas', async (_req, res) => {
        try {
          const heroRotativasPath = path.resolve(process.cwd(), 'rotativas');
          const clientRotativasPath = path.resolve(process.cwd(), 'client', 'public', 'rotativas');
          const dirToUse = fs.existsSync(heroRotativasPath) ? heroRotativasPath : clientRotativasPath;
          
          if (!fs.existsSync(dirToUse)) {
            return res.json({ images: [] });
          }

          const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
          const files = await fs.promises.readdir(dirToUse, { withFileTypes: true });
          const images = files
            .filter((file) => file.isFile() && supportedExtensions.has(path.extname(file.name).toLowerCase()))
            .map((file) => `/rotativas/${encodeURIComponent(file.name)}`);

          res.setHeader('Cache-Control', 'public, max-age=300');
          res.json({ images });
        } catch (error) {
          res.status(500).json({ images: [] });
        }
      });

      app.use('/api', (req, res, next) => {
        if (!res.headersSent) {
          return res.status(404).json({ message: 'Not Found' });
        }
        return next();
      });

      app.use((err: any, _req: any, res: any, _next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || 'Internal Server Error';
        if (!res.headersSent) {
          res.status(status).json({ message });
        }
        console.error(err);
      });

      initialized = true;
    })();
  }
  return initPromise;
}

export default async function handler(req: any, res: any) {
  await ensureInit();
  return app(req, res);
}
