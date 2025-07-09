#!/bin/bash

# ========================================================================
# Fix Production Vite Build - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing production vite build..."

cd $PROJECT_DIR

echo "1. Stopping PM2 process..."
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

echo "2. Installing vite dependencies..."
sudo -u $APP_USER npm install --save-dev vite@latest @vitejs/plugin-react@latest @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer esbuild typescript

echo "3. Building client without --force flag..."
sudo -u $APP_USER npx vite build --outDir dist/public

echo "4. Verifying client build..."
if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Client build successful"
    ls -la dist/public/
    echo "Client build files:"
    find dist/public -type f | head -10
else
    echo "❌ Client build failed"
    exit 1
fi

echo "5. Building server..."
sudo -u $APP_USER npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/server.js \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:@replit/vite-plugin-cartographer \
  --external:pg-native

echo "6. Creating server entry point..."
sudo -u $APP_USER bash -c "
cat > dist/index.js << 'EOF'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Action Protection production server...');

import('./server.js').then(() => {
    console.log('✅ Action Protection server started successfully on port 4000');
}).catch(err => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
});
EOF
"

echo "7. Verifying all build files..."
echo "Build directory contents:"
ls -la dist/

echo "8. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "9. Starting PM2..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

echo "10. Testing API with extended timeout..."
sleep 15
for i in {1..15}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding on attempt $i"
        break
    else
        echo "❌ API not responding on attempt $i, waiting..."
        sleep 3
    fi
done

echo "11. Final verification..."
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ Production vite build fix successful!"
    echo "🌐 Website should be accessible at: http://demox.actionprotectionkw.com"
else
    echo "❌ API still not responding after build fix"
    echo "📋 PM2 logs:"
    sudo -u $APP_USER pm2 logs action-protection --lines 15 --nostream
fi

echo ""
echo "🎉 Production vite build fix completed!"
echo "📋 Final Status:"
sudo -u $APP_USER pm2 list