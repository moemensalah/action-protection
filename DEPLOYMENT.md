# Production Deployment Guide

## Common Issues and Solutions

### 404 Errors for API Routes

If you're getting 404 errors for `/api/categories` and `/api/products` on your remote server, here are the most common causes and solutions:

#### 1. Build Process Issues
Make sure you're running the correct build commands:

```bash
# Build the application
npm run build

# Start production server
npm start
```

#### 2. Server Configuration
Your production server needs to properly handle both API routes and client-side routing. The main issues are:

- **Missing API route registration**: The production build might not be registering the Express routes properly
- **Static file serving conflicts**: The server might be serving static files instead of API responses
- **Module resolution**: ES modules might not resolve correctly in production

#### 3. Production Server Setup

For deployment platforms like Vercel, Netlify, or traditional hosting:

**Option A: Single Server (Recommended)**
Update your production entry point to handle both API and static serving:

```javascript
// In server/index.ts - ensure this runs in production
import express from "express";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes BEFORE static files
await registerRoutes(app);

// Serve static files (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(path.resolve('dist/index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 4. Platform-Specific Solutions

**For Vercel:**
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

**For Traditional Hosting (PM2, Docker, etc.):**
Ensure your process manager runs the correct entry point and that the build artifacts are in the right location.

#### 5. Environment Variables
Make sure these are set in production:
```
NODE_ENV=production
PORT=5000
```

#### 6. Debugging Steps

1. **Check if the server starts**: Look for "Server running on port X" in logs
2. **Verify API routes are registered**: Add console.log in registerRoutes function
3. **Test API directly**: Try accessing `yourdomain.com/api/categories` directly
4. **Check build output**: Ensure `dist` folder contains both client files and server bundle

#### 7. Quick Fix for Current Deployment

If you're still getting 404s, try this immediate fix:

1. SSH into your server or access your deployment platform
2. Check if the process is running: `ps aux | grep node`
3. Restart with explicit production settings:
   ```bash
   NODE_ENV=production PORT=5000 node dist/index.js
   ```
4. If that fails, check the actual file structure:
   ```bash
   ls -la dist/
   ```

The issue is likely that your production server isn't properly registering the Express routes or is serving static files before checking for API routes.