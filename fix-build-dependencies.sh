#!/bin/bash

# ========================================================================
# Fix Build Dependencies - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing build dependencies for Action Protection..."

cd $PROJECT_DIR

echo "1. Stopping PM2 process..."
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

echo "2. Installing dependencies with dev dependencies..."
sudo -u $APP_USER npm install

echo "3. Building client without --force flag..."
sudo -u $APP_USER npx vite build

echo "4. Building server with external vite dependencies..."
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

echo "5. Creating minimal server entry point..."
sudo -u $APP_USER bash -c "
cat > dist/index.js << 'EOFSERVER'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import and start the server
import('./server.js').catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
EOFSERVER
"

echo "6. Verifying build outputs..."
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

if [ -f "dist/public/index.html" ]; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed"
    exit 1
fi

echo "7. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "8. Creating production-ready ecosystem config..."
sudo -u $APP_USER tee ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'dist/index.js',
    cwd: '/home/actionprotection/action-protection',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db'
    },
    error_file: '/home/actionprotection/action-protection/logs/error.log',
    out_file: '/home/actionprotection/action-protection/logs/out.log',
    log_file: '/home/actionprotection/action-protection/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    restart_delay: 5000
  }]
};
EOF

echo "9. Creating logs directory..."
sudo -u $APP_USER mkdir -p logs

echo "10. Starting PM2 application..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

echo "11. Waiting for startup..."
sleep 15

echo "12. Testing API..."
for i in {1..10}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding on attempt $i"
        break
    else
        echo "❌ API not responding on attempt $i, waiting..."
        sleep 3
    fi
done

echo "13. Final verification..."
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ Build dependencies fix successful!"
    echo "🌐 Website should be accessible at: http://demox.actionprotectionkw.com"
else
    echo "❌ API still not responding"
    echo "📋 Recent logs:"
    sudo -u $APP_USER pm2 logs action-protection --lines 15 --nostream
    exit 1
fi

echo ""
echo "🎉 Build dependencies fix completed!"
echo "📋 PM2 Status:"
sudo -u $APP_USER pm2 list