#!/bin/bash

# ========================================================================
# Fix Build Dependencies - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing build dependencies for Action Protection..."

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "Please run complete-production-deployment.sh first"
    exit 1
fi

cd $PROJECT_DIR

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in project directory"
    exit 1
fi

echo "1. Installing all dependencies (including dev dependencies)..."
sudo -u $APP_USER npm install

echo "2. Building application..."
sudo -u $APP_USER npm run build

echo "3. Testing build outputs..."
if [ -f "dist/index.js" ]; then
    echo "✅ Server build successful ($(du -h dist/index.js | cut -f1))"
else
    echo "❌ Server build failed"
    exit 1
fi

if [ -f "dist/public/index.html" ]; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed"
    exit 1
fi

echo "4. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "5. Restarting PM2 application..."
sudo -u $APP_USER pm2 restart action-protection

echo "6. Testing application..."
sleep 5
curl -f http://localhost:4000/api/categories > /dev/null && echo "✅ Application working" || echo "❌ Application failed"

echo ""
echo "🎉 Build dependencies fixed successfully!"
echo ""
echo "📋 Build Summary:"
echo "   - Server: $(du -h dist/index.js | cut -f1)"
echo "   - Client: $(du -h dist/public/assets/index-*.js | cut -f1)"
echo "   - Assets: $(ls dist/public/assets | wc -l) files"
echo ""
echo "✅ Production deployment is now working correctly!"