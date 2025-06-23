import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set production environment
process.env.NODE_ENV = 'production';

async function startProductionServer() {
  try {
    // Register API routes first
    await registerRoutes(app);
    
    // Serve static files from dist/public
    const staticPath = path.join(__dirname, 'dist', 'public');
    app.use(express.static(staticPath));
    
    // Serve logo assets specifically
    app.use('/assets', express.static(path.join(staticPath, 'assets')));
    
    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
      } else {
        res.sendFile(path.join(staticPath, 'index.html'));
      }
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Production server running on port ${PORT}`);
      console.log(`Frontend: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/categories`);
    });
    
  } catch (error) {
    console.error('Failed to start production server:', error);
    process.exit(1);
  }
}

startProductionServer();