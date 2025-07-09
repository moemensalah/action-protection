#!/bin/bash

# ========================================================================
# Fix PM2 Application - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing PM2 application for Action Protection..."

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

echo "1. Checking PM2 status..."
sudo -u $APP_USER pm2 list || echo "PM2 not running or no processes"

echo "2. Checking if dist/index.js exists..."
if [ -f "dist/index.js" ]; then
    echo "✅ Server build exists ($(du -h dist/index.js | cut -f1))"
else
    echo "❌ Server build missing - rebuilding..."
    sudo -u $APP_USER bash -c "
        export NODE_ENV=production
        npm install
        npx vite build --force
        npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    "
fi

echo "3. Stopping any existing PM2 processes..."
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

echo "4. Creating PM2 ecosystem config..."
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

echo "5. Creating logs directory..."
sudo -u $APP_USER mkdir -p logs

echo "6. Starting PM2 application..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

echo "7. Saving PM2 configuration..."
sudo -u $APP_USER pm2 save

echo "8. Waiting for application startup..."
sleep 10

echo "9. Checking PM2 status..."
sudo -u $APP_USER pm2 list

echo "10. Testing API endpoint..."
for i in {1..5}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding on attempt $i"
        break
    else
        echo "❌ API not responding on attempt $i, waiting..."
        sleep 2
    fi
done

echo "11. Checking application logs..."
echo "📋 Recent logs:"
sudo -u $APP_USER pm2 logs action-protection --lines 10 --nostream

echo "12. Final status check..."
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ Application is working correctly"
    echo "🌐 Website should be accessible at: http://demox.actionprotectionkw.com"
else
    echo "❌ Application still not responding"
    echo "📋 Error logs:"
    sudo -u $APP_USER pm2 logs action-protection --err --lines 20 --nostream
    exit 1
fi

echo ""
echo "🎉 PM2 application fix completed!"
echo "📋 Application Status:"
sudo -u $APP_USER pm2 list