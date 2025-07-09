#!/bin/bash

# ========================================================================
# Complete 404 Fix - Action Protection
# ========================================================================

set -e

echo "🚀 Complete 404 fix for Action Protection..."
echo "This will fix both the application and nginx configuration"
echo ""

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

# Step 1: Fix PM2 application
echo "STEP 1: Fixing PM2 application..."
./fix-pm2-application.sh

# Step 2: Test API after PM2 fix
echo ""
echo "STEP 2: Testing API after PM2 fix..."
sleep 5
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ API is now working"
else
    echo "❌ API still not working - checking logs"
    sudo -u $APP_USER pm2 logs action-protection --lines 10 --nostream
    exit 1
fi

# Step 3: Update nginx configuration (already done by quick-fix-nginx.sh)
echo ""
echo "STEP 3: Verifying nginx configuration..."
if grep -q "dist/public/assets" /etc/nginx/sites-available/action-protection; then
    echo "✅ Nginx configuration already updated"
else
    echo "🔧 Updating nginx configuration..."
    ./quick-fix-nginx.sh
fi

# Step 4: Test complete website
echo ""
echo "STEP 4: Testing complete website..."
sleep 3

echo "📋 Testing API through nginx proxy..."
curl -f http://localhost/api/categories > /dev/null 2>&1 && echo "✅ API proxy working" || echo "❌ API proxy not working"

echo "📋 Testing main website..."
curl -I http://localhost/ 2>&1 | head -3

echo "📋 Testing static assets..."
if [ -d "$PROJECT_DIR/dist/public/assets" ]; then
    ASSET_FILE=$(ls "$PROJECT_DIR/dist/public/assets"/*.js | head -1 | xargs basename)
    if [ -n "$ASSET_FILE" ]; then
        curl -I "http://localhost/assets/$ASSET_FILE" 2>&1 | head -1
    fi
fi

echo ""
echo "🎉 Complete 404 fix finished!"
echo ""
echo "📋 Final Status:"
echo "   - PM2 Process: $(sudo -u $APP_USER pm2 list | grep action-protection | awk '{print $10}' || echo 'Not running')"
echo "   - Nginx Status: $(sudo systemctl is-active nginx)"
echo "   - API Status: $(curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo 'Working' || echo 'Not responding')"
echo "   - Website: http://demox.actionprotectionkw.com"
echo ""
echo "If website is still not working, check:"
echo "1. Domain DNS settings"
echo "2. Cloudflare SSL settings (should be 'Flexible' mode)"
echo "3. Firewall settings"