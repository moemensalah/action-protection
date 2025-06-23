#!/bin/bash

cd /home/appuser/latelounge

echo "=== FINAL FRONTEND FIX ==="

# Stop PM2
pm2 stop all
pm2 delete all

# Update server configuration for correct static file serving
cat > server/index.ts << 'EOF'
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Serve static assets in development
  if (process.env.NODE_ENV === "development") {
    app.use('/assets', express.static('attached_assets'));
  }

  // Register API routes first
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Production static file serving
  if (process.env.NODE_ENV === "production") {
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, "public")));
    
    // Serve uploads directory
    app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
    
    // Serve manifest.json with proper MIME type
    app.get("/manifest.json", (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.sendFile(path.join(__dirname, "public", "manifest.json"));
    });
    
    // Handle client-side routing
    app.get("*", (req: Request, res: Response) => {
      if (req.path.startsWith("/api")) {
        res.status(404).json({ error: "API endpoint not found" });
      } else {
        res.sendFile(path.join(__dirname, "public", "index.html"));
      }
    });
    
    const PORT = parseInt(process.env.PORT || "5000");
    server.listen(PORT, "0.0.0.0", () => {
      log(`Production server running on port ${PORT}`);
      log(`API available at http://localhost:${PORT}/api/categories`);
    });
  } else {
    // Development setup with Vite
    await setupVite(app, server);
  }
})();
EOF

# Rebuild application
npm run build

# Check build output
ls -la dist/public/

# Start PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

# Test endpoints
sleep 5
echo "Testing API:"
curl -s http://localhost:3000/api/categories | head -50

echo -e "\nTesting frontend:"
curl -I http://localhost:3000

echo -e "\nTesting index.html directly:"
curl -I http://localhost:3000/index.html

echo "=== FRONTEND FIX COMPLETE ==="