#!/bin/bash

# ========================================================================
# Fix Build PATH Issue - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing build PATH issue for Action Protection..."

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "Please run complete-production-deployment.sh first"
    exit 1
fi

cd $PROJECT_DIR

echo "1. Installing all dependencies (including dev dependencies)..."
sudo -u $APP_USER npm install

echo "2. Checking available build tools..."
sudo -u $APP_USER bash -c "
    echo 'PATH: \$PATH'
    echo 'Node version: \$(node --version)'
    echo 'NPM version: \$(npm --version)'
    echo 'Checking for vite...'
    which vite || echo 'vite not in PATH'
    echo 'Checking for esbuild...'
    which esbuild || echo 'esbuild not in PATH'
    echo 'Checking in node_modules/.bin...'
    ls -la node_modules/.bin/ | grep -E '(vite|esbuild)'
"

echo "3. Building application with explicit PATH..."
sudo -u $APP_USER bash -c "
    export PATH=\$PATH:./node_modules/.bin
    echo 'Updated PATH: \$PATH'
    echo 'Building with vite...'
    ./node_modules/.bin/vite build
    echo 'Building with esbuild...'
    ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
"

echo "4. Verifying build outputs..."
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

echo "5. Removing dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "6. Restarting PM2 application..."
sudo -u $APP_USER pm2 restart action-protection

echo "7. Testing application..."
sleep 5
curl -f http://localhost:4000/api/categories > /dev/null && echo "✅ Application working" || echo "❌ Application failed"

echo ""
echo "🎉 Build PATH issue fixed successfully!"
echo ""
echo "📋 Build Summary:"
echo "   - Server: $(du -h dist/index.js | cut -f1)"
echo "   - Client: $(ls dist/public/assets/*.js | wc -l) JS files"
echo "   - Assets: $(ls dist/public/assets | wc -l) total files"
echo ""
echo "✅ Production deployment is now working correctly!"