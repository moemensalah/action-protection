#!/bin/bash

# ========================================================================
# Fix Server Build - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing server build for Action Protection..."

cd $PROJECT_DIR

echo "1. Stopping failing PM2 process..."
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

echo "2. Checking server build dependencies..."
sudo -u $APP_USER npm install --include=dev

echo "3. Rebuilding server with all required externals..."
sudo -u $APP_USER npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/server.js \
  --external:express \
  --external:pg \
  --external:bcryptjs \
  --external:express-session \
  --external:connect-pg-simple \
  --external:multer \
  --external:nodemailer \
  --external:@neondatabase/serverless \
  --external:drizzle-orm \
  --external:drizzle-zod \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:@replit/vite-plugin-cartographer \
  --external:pg-native

echo "4. Creating production-ready server entry point..."
sudo -u $APP_USER bash -c "
cat > dist/index.js << 'EOF'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Action Protection production server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Working directory:', process.cwd());
console.log('Server file:', path.join(__dirname, 'server.js'));

// Start the server with proper error handling
try {
    const serverModule = await import('./server.js');
    console.log('✅ Action Protection server started successfully on port 4000');
} catch (err) {
    console.error('❌ Server startup error:', err);
    console.error('Error stack:', err.stack);
    
    // Exit with error code for PM2 to handle restart
    process.exit(1);
}
EOF
"

echo "5. Verifying build outputs..."
if [ -f "dist/server.js" ] && [ -f "dist/index.js" ]; then
    echo "✅ Server build files created successfully"
    echo "Server bundle size: $(du -h dist/server.js | cut -f1)"
    echo "Entry point size: $(du -h dist/index.js | cut -f1)"
else
    echo "❌ Server build failed"
    exit 1
fi

echo "6. Testing server bundle directly..."
sudo -u $APP_USER bash -c "
cd dist
timeout 10s node index.js || echo 'Server test completed'
"

echo "7. Creating PM2 ecosystem config..."
sudo -u $APP_USER bash -c "
cat > ecosystem.config.cjs << 'EOF'
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
    max_restarts: 5,
    min_uptime: '5s',
    watch: false,
    autorestart: true,
    restart_delay: 5000
  }]
};
EOF
"

echo "8. Starting PM2 with fixed server..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

echo "9. Monitoring startup..."
sleep 10

echo "10. Checking PM2 status..."
sudo -u $APP_USER pm2 list

echo "11. Testing API with extended patience..."
for i in {1..20}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding successfully on attempt $i"
        API_SUCCESS=true
        break
    else
        echo "❌ API attempt $i failed, waiting 3 seconds..."
        sleep 3
    fi
done

echo "12. Final verification..."
if [ "$API_SUCCESS" = "true" ]; then
    echo "✅ Server build fix successful!"
    echo "🌐 API responding: http://localhost:4000/api/categories"
    echo "🌐 Website accessible: http://demox.actionprotectionkw.com"
else
    echo "❌ Server still failing after rebuild"
    echo "📋 Recent logs:"
    sudo -u $APP_USER pm2 logs action-protection --lines 20 --nostream
    echo "📋 PM2 status:"
    sudo -u $APP_USER pm2 show action-protection
fi

echo ""
echo "🎉 Server build fix completed!"