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
    echo 'Building with direct paths...'
    ./node_modules/.bin/vite build
    ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
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