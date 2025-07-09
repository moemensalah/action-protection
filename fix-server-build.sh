#!/bin/bash

# ========================================================================
# Fix Server Build - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing server build issue for Action Protection..."

cd $PROJECT_DIR

echo "1. Stopping PM2 process..."
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

echo "2. Installing all dependencies..."
sudo -u $APP_USER npm install

echo "3. Building with proper server bundling..."
sudo -u $APP_USER bash -c "
    echo 'Building client...'
    npx vite build --force
    
    echo 'Building server with proper bundling...'
    npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/server.js --external:pg-native
    
    echo 'Creating proper server entry point...'
    cat > dist/index.js << 'EOF'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Start the server
import('./server.js').catch(console.error);
EOF
"

echo "4. Verifying build outputs..."
if [ -f "dist/server.js" ]; then
    echo "✅ Server build successful ($(du -h dist/server.js | cut -f1))"
else
    echo "❌ Server build failed"
    exit 1
fi

if [ -f "dist/index.js" ]; then
    echo "✅ Entry point created"
else
    echo "❌ Entry point creation failed"
    exit 1
fi

echo "5. Testing server bundle..."
cd dist
sudo -u $APP_USER node -e "
    console.log('Testing server bundle...');
    import('./server.js').then(() => {
        console.log('✅ Server bundle loads successfully');
        process.exit(0);
    }).catch(err => {
        console.error('❌ Server bundle error:', err.message);
        process.exit(1);
    });
" || echo "Server bundle test failed"

cd ..

echo "6. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "7. Starting PM2 with fixed build..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

echo "8. Waiting for startup..."
sleep 10

echo "9. Testing API..."
for i in {1..5}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding on attempt $i"
        break
    else
        echo "❌ API not responding on attempt $i, waiting..."
        sleep 3
    fi
done

echo "10. Final status check..."
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ Server build fix successful!"
    echo "🌐 Website should be accessible at: http://demox.actionprotectionkw.com"
else
    echo "❌ Server still not responding"
    echo "📋 Recent logs:"
    sudo -u $APP_USER pm2 logs action-protection --lines 10 --nostream
    exit 1
fi

echo ""
echo "🎉 Server build fix completed!"
echo "📋 PM2 Status:"
sudo -u $APP_USER pm2 list