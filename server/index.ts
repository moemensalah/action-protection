import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware for local authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 100)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.substring(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let server: any;

(async () => {
  server = await registerRoutes(app);

  // Error handling middleware  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Development setup with Vite
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
    
    const PORT = parseInt(process.env.PORT || "5000");
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });
  } else {
    // Production static file serving
    await serveStatic(app);
    
    const PORT = parseInt(process.env.PORT || "5000");
    server.listen(PORT, "0.0.0.0", () => {
      log(`Production server running on port ${PORT}`);
    });
  }
})();