#!/bin/bash

cd /home/appuser/latelounge

echo "=== FIXING MANIFEST AND ASSETS ==="

# Stop PM2
pm2 stop all

# Create a simple manifest.json in the public directory
mkdir -p dist/public
cat > dist/public/manifest.json << 'EOF'
{
  "name": "LateLounge Cafe",
  "short_name": "LateLounge",
  "description": "Bilingual cafe website with interactive ordering",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ]
}
EOF

# Update server to handle missing manifest gracefully
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
  if (process.env.NODE_ENV === "development") {
    app.use('/assets', express.static('attached_assets'));
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    const path = await import("path");
    const fs = await import("fs");
    const { fileURLToPath } = await import("url");
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, "public")));
    
    // Serve uploads directory
    app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
    
    // Handle manifest.json with error handling
    app.get("/manifest.json", (req: Request, res: Response) => {
      const manifestPath = path.join(__dirname, "public", "manifest.json");
      fs.access(manifestPath, fs.constants.F_OK, (err) => {
        if (err) {
          // Return a basic manifest if file doesn't exist
          res.json({
            name: "LateLounge Cafe",
            short_name: "LateLounge",
            start_url: "/",
            display: "standalone"
          });
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.sendFile(manifestPath);
        }
      });
    });
    
    // Handle client-side routing
    app.get("*", (req: Request, res: Response) => {
      if (req.path.startsWith("/api")) {
        res.status(404).json({ error: "API endpoint not found" });
      } else {
        const indexPath = path.join(__dirname, "public", "index.html");
        fs.access(indexPath, fs.constants.F_OK, (err) => {
          if (err) {
            res.status(404).send("Frontend not built. Run npm run build.");
          } else {
            res.sendFile(indexPath);
          }
        });
      }
    });
    
    const PORT = parseInt(process.env.PORT || "5000");
    server.listen(PORT, "0.0.0.0", () => {
      log(`Production server running on port ${PORT}`);
      log(`API available at http://localhost:${PORT}/api/categories`);
    });
  } else {
    await setupVite(app, server);
  }
})();
EOF

# Rebuild application
npm run build

# Verify files exist
echo "Checking build files:"
ls -la dist/public/

# Start PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "Testing in 5 seconds..."
sleep 5

echo "API Test:"
curl -s http://localhost:3000/api/categories | head -20

echo -e "\nFrontend Test:"
curl -s http://localhost:3000/ | head -30

echo -e "\nManifest Test:"
curl -s http://localhost:3000/manifest.json

echo "=== FIX COMPLETE ==="