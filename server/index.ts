import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import cors from "cors";
=======
import fs from 'fs';
import path from 'path';
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
<<<<<<< HEAD

// Enable CORS for development
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Allow requests from the Vite dev server
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
=======
// allow larger payloads for base64 image uploads from the admin UI
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    } else {
      console.warn('Error after headers sent:', message);
    }

    // log the error and do not re-throw to avoid crashing dev server
    console.error(err);
  });

  // serve uploaded files from /uploads
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
<<<<<<< HEAD
  const port = parseInt(process.env.PORT || "5000", 10);
  // On some platforms (Windows) the `reusePort` option is not supported.
  // Use the simpler listen signature for cross-platform compatibility.
=======
  const port = parseInt(process.env.PORT || '5000', 10);
>>>>>>> 62c653961657e3119ed8e2a10375ecbc1fa9a36a
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
