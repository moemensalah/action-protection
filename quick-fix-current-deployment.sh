#!/bin/bash

# ========================================================================
# Quick Fix for Current Deployment Issue - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🚨 Quick fix for 'vite not found' build issue..."
echo "This will fix the current deployment without full redeployment"
echo ""

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "Please run this script on the server where Action Protection is deployed"
    exit 1
fi

cd $PROJECT_DIR

echo "1. Installing all dependencies (including dev dependencies needed for build)..."
sudo -u $APP_USER npm install

echo "2. Building application..."
sudo -u $APP_USER bash -c "
    export PATH=\$PATH:./node_modules/.bin
    echo 'Checking for build tools...'
    ls -la node_modules/.bin/ | grep -E '(vite|esbuild)' || echo 'Build tools not found, using npx'
    echo 'Building with npx to ensure tools are available...'
    npx vite build
    echo 'Building server with proper bundling...'
    npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/server.js --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:@replit/vite-plugin-cartographer --external:pg-native
    echo 'Creating proper server entry point...'
    cat > dist/index.js << 'EOFSERVER'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
import('./server.js').catch(console.error);
EOFSERVER
"

if [ -f "dist/index.js" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful!"
    
    echo "3. Removing dev dependencies to save space..."
    sudo -u $APP_USER npm prune --production
    
    echo "4. Restarting PM2 application..."
    sudo -u $APP_USER pm2 restart action-protection
    
    echo "5. Testing application..."
    sleep 5
    
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ Application is working correctly!"
    else
        echo "⚠️  Application may need more time to start. Check with:"
        echo "   sudo -u $APP_USER pm2 logs action-protection"
    fi
    
    echo ""
    echo "🎉 Quick fix completed successfully!"
    echo ""
    echo "📋 Application Status:"
    sudo -u $APP_USER pm2 list
    
else
    echo "❌ Build failed. Please check the error messages above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Ensure all project files are present"
    echo "   - Check that package.json contains all necessary dependencies"
    echo "   - Verify Node.js version is compatible"
    echo ""
    echo "📋 For complete redeployment, use:"
    echo "   ./complete-production-deployment.sh"
fi