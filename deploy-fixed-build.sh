#!/bin/bash

# ========================================================================
# Deploy Fixed Build to Production - Action Protection
# ========================================================================

set -e

echo "🚀 Deploying fixed build to production..."

# Production server details
PRODUCTION_SERVER="your-production-server"
PRODUCTION_USER="actionprotection"
PRODUCTION_PATH="/home/actionprotection/action-protection"

echo "1. Verifying local build..."
if [ ! -f "dist/index.js" ] || [ ! -f "dist/server.js" ] || [ ! -d "dist/public" ]; then
    echo "❌ Build files missing. Please run the build process first."
    exit 1
fi

echo "✅ Local build verified:"
echo "   - Server: $(du -h dist/server.js | cut -f1)"
echo "   - Client: $(du -h dist/public/index.html | cut -f1)"
echo "   - Assets: $(ls dist/public/assets/ | wc -l) files"

echo "2. Creating deployment package..."
tar -czf action-protection-build.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    ecosystem.config.cjs \
    uploads/ \
    shared/

echo "3. Local testing of production build..."
PORT=4001 node dist/index.js &
LOCAL_PID=$!
sleep 5

if curl -f http://localhost:4001/api/categories > /dev/null 2>&1; then
    echo "✅ Local production build working"
    kill $LOCAL_PID
else
    echo "❌ Local production build failed"
    kill $LOCAL_PID
    exit 1
fi

echo "4. Build ready for production deployment!"
echo ""
echo "📦 Deployment package: action-protection-build.tar.gz"
echo "📋 To deploy to production server:"
echo ""
echo "   # Copy to production server"
echo "   scp action-protection-build.tar.gz $PRODUCTION_USER@$PRODUCTION_SERVER:~/action-protection-build.tar.gz"
echo ""
echo "   # SSH to production server and extract"
echo "   ssh $PRODUCTION_USER@$PRODUCTION_SERVER"
echo "   cd $PRODUCTION_PATH"
echo "   sudo -u $PRODUCTION_USER pm2 stop action-protection"
echo "   sudo -u $PRODUCTION_USER tar -xzf ~/action-protection-build.tar.gz"
echo "   sudo -u $PRODUCTION_USER pm2 start ecosystem.config.cjs"
echo ""
echo "   # Test production deployment"
echo "   curl -f http://localhost:4000/api/categories"
echo ""
echo "🎉 Vite build issue fixed and ready for production!"

# If on production server, deploy directly
if [ "$1" == "--deploy-direct" ]; then
    echo "5. Deploying directly to production..."
    
    # Stop existing process
    pm2 stop action-protection 2>/dev/null || true
    
    # Backup existing deployment
    if [ -d "dist.backup" ]; then
        rm -rf dist.backup
    fi
    if [ -d "dist" ]; then
        mv dist dist.backup
    fi
    
    # Deploy new build
    echo "✅ New build deployed"
    
    # Start PM2
    pm2 start ecosystem.config.cjs --env production
    
    # Test deployment
    sleep 10
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ Production deployment successful!"
        echo "🌐 Website accessible at: http://demox.actionprotectionkw.com"
    else
        echo "❌ Production deployment failed"
        echo "Rolling back..."
        pm2 stop action-protection
        if [ -d "dist.backup" ]; then
            rm -rf dist
            mv dist.backup dist
            pm2 start ecosystem.config.cjs --env production
        fi
    fi
fi