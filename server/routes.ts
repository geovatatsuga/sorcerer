import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isDevAdmin } from "./replitAuth";
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { 
  insertChapterSchema, 
  insertCharacterSchema, 
  insertLocationSchema,
  insertCodexEntrySchema,
  insertBlogPostSchema, 
  insertReadingProgressSchema 
} from "@shared/schema";

async function saveTranslations(_resource: string, _id: string, _translations: Record<string, any>) {
  // Translation system intentionally disabled.
  // This function is kept as a no-op to avoid breaking callers that still send
  // translation payloads from the client. If translations are reintroduced
  // later, restore the original implementation.
  return;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  
  // Public Route - single Codex entry by id
  app.get("/api/codex/:id", async (req, res) => {
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
  // Return current authenticated user information or null
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Session-based dev login
      const sessionUser = (req.session?.user as any) || null;
      return res.json(sessionUser);
    } catch (err) {
      console.error('Auth user error:', err);
      return res.status(500).json({ message: 'Failed to get user info' });
    }
  });

  // Public Routes - Chapters
  app.get("/api/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChapters();
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/:slug", async (req, res) => {
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

  // Public Routes - Characters
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  // Public Route - single Character by id
  // Public Route - single Character by slug
  app.get("/api/characters/slug/:slug", async (req, res) => {
    try {
      const character = await storage.getCharacterBySlug(req.params.slug);
      if (!character) {
        res.status(404).json({ message: "Character not found" });
        return;
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character by slug" });
    }
  });

  // Public Route - single Character by id
  app.get("/api/characters/:id", async (req, res) => {
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

  // Public Routes - Locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Public Route - single Location by id
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocationById(req.params.id);
      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // Public Routes - Codex
  app.get("/api/codex", async (req, res) => {
    try {
      const { category } = req.query;
      const entries = category 
        ? await storage.getCodexEntriesByCategory(category as string)
        : await storage.getCodexEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch codex entries" });
    }
  });

  // Public Routes - Blog
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
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

  // Reading Progress (no auth required, uses session)
  app.get("/api/reading-progress/:sessionId/:chapterId", async (req, res) => {
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

  app.put("/api/reading-progress", async (req, res) => {
    try {
      const { sessionId, chapterId, progress } = req.body;
      if (!sessionId || !chapterId || typeof progress !== 'number') {
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

  // Newsletter signup
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        res.status(400).json({ message: "Valid email address required" });
        return;
      }
      // In a real app, this would integrate with an email service
      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Translation service disabled: return a clear 501 so callers know it's not available.
  app.post('/api/translate', async (_req, res) => {
    return res.status(501).json({ message: 'Translation provider disabled' });
  });

  // ADMIN ROUTES - All require admin authentication
  
  // Admin Chapters
  app.post("/api/admin/chapters", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" and "translations" properties' });

  // NOTE: do not convert publishedAt to Date before validation (Zod expects strings)
  // Keep publishedAt as string for validation; normalize to ISO after validation if present.
      // Provide sensible defaults if UI fails to send title/excerpt so validation doesn't fail silently
      if (!data.title) {
        const fallbackTitle = data.slug || 'Untitled Chapter';
        console.warn('Chapter payload missing title, defaulting to:', fallbackTitle);
        data.title = fallbackTitle;
      }
      if (!data.excerpt) {
        if (typeof data.content === 'string' && data.content.length > 0) {
          data.excerpt = String(data.content).slice(0, 200);
          console.warn('Chapter payload missing excerpt, deriving from content (200 chars)');
        } else {
          data.excerpt = '';
        }
      }
      const validatedData = insertChapterSchema.parse(data);
      const chapter = await storage.createChapter(validatedData);

      // Save translations
      if (chapter?.id && translations) {
        await saveTranslations('chapters', chapter.id, translations);
      }

      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Chapter validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Create chapter error:", error);
      res.status(500).json({ message: "Failed to create chapter", error: String(error) });
    }
  });

  app.put("/api/admin/chapters/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertChapterSchema.partial().parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const chapter = await storage.updateChapter(req.params.id, validatedData);
      if (!chapter) {
        res.status(404).json({ message: "Chapter not found" });
        return;
      }

      // Save translations
      if (chapter?.id && translations) {
        await saveTranslations('chapters', chapter.id, translations);
      }
      
      res.json(chapter);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Chapter validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Update chapter error:", error);
      res.status(500).json({ message: "Failed to update chapter", error: String(error) });
    }
  });

  app.delete("/api/admin/chapters/:id", isDevAdmin, async (req, res) => {
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

  // Admin Characters
  app.post("/api/admin/characters", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

  // Debug: log translations shape to help diagnose missing EN/ES saves
  try { console.log('ADMIN CREATE CHARACTER translations keys:', translations ? Object.keys(translations) : '(none)', 'translations sample:', translations ? (Object.keys(translations).slice(0,3).reduce((acc, k) => ({ ...acc, [k]: Object.keys(translations[k] || {}).slice(0,3) }), {})) : null); } catch(e) {}

      const validatedData = insertCharacterSchema.parse(data);
      const character = await storage.createCharacter(validatedData);

      if (character?.id && translations) {
        await saveTranslations('characters', character.id, translations);
      }

      res.status(201).json(character);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Character validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Create character error:", error);
      res.status(500).json({ message: "Failed to create character", error: String(error) });
    }
  });

  app.put("/api/admin/characters/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

  // Debug: log translations shape to help diagnose missing EN/ES saves on update
  try { console.log('ADMIN UPDATE CHARACTER id=', req.params.id, 'translations keys:', translations ? Object.keys(translations) : '(none)', 'translations sample:', translations ? (Object.keys(translations).slice(0,3).reduce((acc, k) => ({ ...acc, [k]: Object.keys(translations[k] || {}).slice(0,3) }), {})) : null); } catch(e) {}

      const validatedData = insertCharacterSchema.partial().parse(data);
      const character = await storage.updateCharacter(req.params.id, validatedData);
      if (!character) {
        res.status(404).json({ message: "Character not found" });
        return;
      }

      if (character?.id && translations) {
        await saveTranslations('characters', character.id, translations);
      }

      res.json(character);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Character validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Update character error:", error);
      res.status(500).json({ message: "Failed to update character", error: String(error) });
    }
  });

  app.delete("/api/admin/characters/:id", isDevAdmin, async (req, res) => {
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

  // Admin Locations (accepts { data, translations } and saves translations like chapters/characters)
  app.post("/api/admin/locations", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertLocationSchema.parse(data);
      const location = await storage.createLocation(validatedData);

      // Save translations if provided
      if (location?.id && translations) {
        await saveTranslations('locations', location.id, translations);
      }

      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Location validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location", error: String(error) });
    }
  });

  app.put("/api/admin/locations/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertLocationSchema.partial().parse(data);
      const location = await storage.updateLocation(req.params.id, validatedData);
      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }

      if (location?.id && translations) {
        await saveTranslations('locations', location.id, translations);
      }

      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Location validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Update location error:", error);
      res.status(500).json({ message: "Failed to update location", error: String(error) });
    }
  });

  app.delete("/api/admin/locations/:id", isDevAdmin, async (req, res) => {
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

  // Admin Codex Entries (accept { data, translations })
  app.post("/api/admin/codex", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertCodexEntrySchema.parse(data);
      const entry = await storage.createCodexEntry(validatedData);

      if (entry?.id && translations) {
        await saveTranslations('codex', entry.id, translations);
      }

      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Codex validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Create codex entry error:", error);
      res.status(500).json({ message: "Failed to create codex entry", error: String(error) });
    }
  });

  app.put("/api/admin/codex/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertCodexEntrySchema.partial().parse(data);
      const entry = await storage.updateCodexEntry(req.params.id, validatedData);
      if (!entry) {
        res.status(404).json({ message: "Codex entry not found" });
        return;
      }

      if (entry?.id && translations) {
        await saveTranslations('codex', entry.id, translations);
      }

      res.json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Codex validation error:', error.errors);
        return res.status(400).json({ message: 'Validation failed', issues: error.errors });
      }
      console.error("Update codex entry error:", error);
      res.status(500).json({ message: "Failed to update codex entry", error: String(error) });
    }
  });

  app.delete("/api/admin/codex/:id", isDevAdmin, async (req, res) => {
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

  // Admin Blog Posts (accept { data, translations })
  app.post("/api/admin/blog", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertBlogPostSchema.parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const post = await storage.createBlogPost(validatedData);

      if (post?.id && translations) {
        await saveTranslations('blog', post.id, translations);
      }

      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data", error: String(error) });
    }
  });

  // Simple image/file upload endpoint (accepts base64 payload)
  // Body: { filename: string, data: string } where data is base64 or dataURL
  app.post('/api/admin/upload', isDevAdmin, async (req, res) => {
    try {
      const { filename, data } = req.body as { filename?: string; data?: string };
      if (!filename || !data) {
        res.status(400).json({ message: 'filename and data (base64) are required' });
        return;
      }

      const base64 = data.includes('base64,') ? data.split('base64,')[1] : data;
      const ext = path.extname(filename) || '';
      const name = `${randomUUID()}${ext}`;
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, name);
      await fs.promises.writeFile(filePath, Buffer.from(base64, 'base64'));
      const url = `/uploads/${name}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Public map save endpoint - saves a map package (svg, markers, masks) to uploads/maps/<id>.json
  app.post('/api/maps', async (req, res) => {
    try {
      const { svg, markers, masks, name } = req.body || {};
      if (!markers || !Array.isArray(markers)) return res.status(400).json({ message: 'markers array required' });
      const id = randomUUID();
      const uploadsDir = path.resolve(process.cwd(), 'uploads', 'maps');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const out = {
        id,
        name: name || `map-${id}`,
        svg: svg || null,
        markers,
        masks: masks || [],
        createdAt: new Date().toISOString(),
      };
      const filePath = path.join(uploadsDir, `${id}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(out, null, 2), 'utf8');
      return res.json({ id, url: `/uploads/maps/${id}.json` });
    } catch (err) {
      console.error('Save map error:', err);
      return res.status(500).json({ message: 'Failed to save map' });
    }
  });

  // Public map fetch endpoint - returns saved map package
  app.get('/api/maps/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const filePath = path.resolve(process.cwd(), 'uploads', 'maps', `${id}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Map not found' });
      const content = await fs.promises.readFile(filePath, 'utf8');
      return res.type('application/json').send(content);
    } catch (err) {
      console.error('Get map error:', err);
      return res.status(500).json({ message: 'Failed to read map' });
    }
  });

  app.put("/api/admin/blog/:id", isDevAdmin, async (req, res) => {
    try {
      const { data, translations } = req.body;
      if (!data) return res.status(400).json({ message: 'Request body must have "data" property' });

      const validatedData = insertBlogPostSchema.partial().parse(data);
      if (validatedData?.publishedAt) {
        validatedData.publishedAt = new Date(String(validatedData.publishedAt)).toISOString();
      }
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        res.status(404).json({ message: "Blog post not found" });
        return;
      }

      if (post?.id && translations) {
        await saveTranslations('blog', post.id, translations);
      }

      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data", error: String(error) });
    }
  });

  app.delete("/api/admin/blog/:id", isDevAdmin, async (req, res) => {
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

  // Development-only helpers: create a local admin user and login as session user
  if (process.env.NODE_ENV === 'development') {
    // Login as a session user for local dev. Body: { id: string }
    app.post('/api/dev/login', (req, res) => {
      try {
        const { id, email, isAdmin = true } = req.body || {};
        if (!id) return res.status(400).json({ message: 'id is required' });
        (req as any).session.user = { id, email: email ?? `${id}@local.dev`, isAdmin };
        return res.json({ ok: true, user: (req as any).session.user });
      } catch (error) {
        console.error('Dev login error:', error);
        return res.status(500).json({ message: 'Failed to login (dev)' });
      }
    });

    // Direct admin access for development - logs in and redirects
    app.get('/api/dev/login', (req, res) => {
      try {
        // Auto-login as admin
        (req as any).session.user = { 
          id: 'dev-admin', 
          email: 'dev-admin@local.dev', 
          isAdmin: true 
        };
        // Redirect to admin page
        return res.redirect('/#/admin');
      } catch (error) {
        console.error('Dev admin error:', error);
        return res.status(500).json({ message: 'Failed to access admin (dev)' });
      }
    });

    // Create or upsert a local admin user. Body: { id?: string, email?: string, displayName?: string, isAdmin?: boolean }
    app.post('/api/dev/create-admin', async (req, res) => {
      try {
        const { id = `dev-${randomUUID()}`, email, displayName, isAdmin = true } = req.body || {};
        const userRecord = await storage.upsertUser({
          id,
          email: email ?? `${id}@local.dev`,
          firstName: displayName ?? 'Dev',
          lastName: '',
          profileImageUrl: undefined,
          isAdmin: !!isAdmin,
        } as any);
        return res.json({ ok: true, user: userRecord });
      } catch (error) {
        console.error('Dev create-admin error:', error);
        return res.status(500).json({ message: 'Failed to create admin user' });
      }
    });

    // Development debug endpoint - returns session and request headers so
    // the developer can compare what the Simple Browser sends vs the system
    // browser. This is intentionally development-only.
    app.get('/api/dev/debug', (req, res) => {
      try {
        const sessionUser = (req.session as any)?.user || null;
        const info = {
          sessionUser,
          headers: {
            host: req.headers.host,
            origin: req.headers.origin,
            referer: req.headers.referer,
            cookie: req.headers.cookie,
            ua: req.headers['user-agent'],
            forwarded: req.headers['x-forwarded-for'] || null,
          },
          url: req.originalUrl,
        };
        return res.json(info);
      } catch (err) {
        console.error('Dev debug error:', err);
        return res.status(500).json({ message: 'Dev debug failed' });
      }
    });

    // Development translation helpers are disabled but kept as harmless stubs so
    // existing client code that tries to read/write translations doesn't fail.
    app.get('/api/dev/translations/:resource/:id', async (req, res) => {
      return res.json({ ok: true, translation: null });
    });

    app.post('/api/dev/translations/:resource/:id', async (req, res) => {
      // Accept the request but don't persist anything.
      return res.json({ ok: true });
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}

