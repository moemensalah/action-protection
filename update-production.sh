#!/bin/bash

# ========================================================================
# Update Production Deployment - Action Protection
# ========================================================================

set -e

# Configuration
PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
GIT_BRANCH="main"

echo "🔄 Updating Action Protection production deployment..."
echo ""

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Production deployment not found at $PROJECT_DIR"
    echo "Please run complete-production-deployment.sh first"
    exit 1
fi

# Stop the application
echo "1. Stopping application..."
sudo -u $APP_USER pm2 stop action-protection || true

# Backup current version
echo "2. Creating backup..."
BACKUP_DIR="/home/$APP_USER/backups/$(date +%Y%m%d_%H%M%S)"
sudo -u $APP_USER mkdir -p $BACKUP_DIR
sudo -u $APP_USER cp -r $PROJECT_DIR $BACKUP_DIR/

# Update from git or local files
echo "3. Updating source code..."
cd $PROJECT_DIR

# Check if it's a git repository
if [ -d ".git" ]; then
    echo "Pulling latest changes from git..."
    sudo -u $APP_USER git fetch origin
    sudo -u $APP_USER git reset --hard origin/$GIT_BRANCH
    echo "✅ Git update completed"
else
    echo "Not a git repository. Please manually update files or use git clone method."
    echo "Current directory: $PROJECT_DIR"
    exit 1
fi

# Install dependencies
echo "4. Installing dependencies..."
sudo -u $APP_USER npm install

# Build application
echo "5. Building application..."
sudo -u $APP_USER bash -c "
    export PATH=\$PATH:./node_modules/.bin
    echo 'Building with npx...'
    npx vite build
    npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/server.js --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:@replit/vite-plugin-cartographer --external:pg-native
    cat > dist/index.js << 'EOFSERVER'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
import('./server.js').catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
EOFSERVER
"

# Verify build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    echo "Attempting to rebuild with explicit PATH..."
    sudo -u $APP_USER bash -c "
        export PATH=\$PATH:./node_modules/.bin
        npm install
        npm run build
    "
    
    if [ ! -f "dist/index.js" ]; then
        echo "❌ Rebuild failed - attempting emergency fix..."
        npx vite build --force
        npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
        if [ ! -f "dist/index.js" ]; then
            echo "❌ Emergency rebuild failed - cannot continue"
            exit 1
        fi
    fi
fi

# Remove dev dependencies after build
echo "6. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

# Database migrations (if needed)
echo "7. Running database migrations..."
sudo -u $APP_USER npm run db:push 2>/dev/null || echo "No migrations needed"

# Start application
echo "8. Starting application..."
sudo -u $APP_USER pm2 start action-protection

# Test deployment
echo "9. Testing deployment..."
sleep 10

# Test API endpoints
echo "Testing API endpoints..."
curl -f http://localhost:4000/api/categories > /dev/null && echo "✅ API working" || echo "❌ API failed"

# Check PM2 status
echo ""
echo "📊 Application Status:"
sudo -u $APP_USER pm2 list

echo ""
echo "🎉 Production update completed successfully!"
echo ""
echo "📁 Backup created at: $BACKUP_DIR"
echo "📋 To rollback if needed: sudo -u $APP_USER cp -r $BACKUP_DIR/action-protection/* $PROJECT_DIR/"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: sudo -u $APP_USER pm2 logs action-protection"
echo "   - Restart: sudo -u $APP_USER pm2 restart action-protection"
echo "   - Stop: sudo -u $APP_USER pm2 stop action-protection"