#!/bin/bash

# ========================================================================
# Emergency Build Fix - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🚨 Emergency build fix for Action Protection..."
echo "This will diagnose and fix the missing build tools issue"
echo ""

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

echo "1. Checking current directory and permissions..."
pwd
ls -la | head -5

echo "2. Checking package.json for build dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    grep -A 10 -B 5 '"devDependencies"' package.json || echo "No devDependencies found"
else
    echo "❌ package.json not found"
    exit 1
fi

echo "3. Checking node_modules directory..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    ls -la node_modules/.bin/ | grep -E '(vite|esbuild)' || echo "❌ Build tools not found in node_modules/.bin"
else
    echo "❌ node_modules not found"
fi

echo "4. Reinstalling dependencies with verbose output..."
sudo -u $APP_USER npm install --verbose

echo "5. Verifying build tools after installation..."
sudo -u $APP_USER ls -la node_modules/.bin/ | grep -E '(vite|esbuild)' || echo "❌ Build tools still not found"

echo "6. Checking npm configuration..."
sudo -u $APP_USER npm config list

echo "7. Attempting to build with npx..."
sudo -u $APP_USER npx vite build --force

echo "8. Building backend with npx..."
sudo -u $APP_USER npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "9. Verifying build outputs..."
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

echo "10. Cleaning up dev dependencies..."
sudo -u $APP_USER npm prune --production

echo "11. Restarting PM2..."
sudo -u $APP_USER pm2 restart action-protection

echo "12. Testing application..."
sleep 5
curl -f http://localhost:4000/api/categories > /dev/null && echo "✅ Application working" || echo "❌ Application failed"

echo ""
echo "🎉 Emergency build fix completed!"
echo ""
echo "📋 Application Status:"
sudo -u $APP_USER pm2 list