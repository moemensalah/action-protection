#!/bin/bash

# ========================================================================
# Diagnose 404 Issue - Action Protection
# ========================================================================

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Comprehensive 404 Issue Diagnosis"
echo "====================================="

# 1. Check project structure
echo "1. Project Structure Check:"
if [ -d "$PROJECT_DIR" ]; then
    echo "✅ Project directory exists"
    cd $PROJECT_DIR
    
    echo "📁 Build structure:"
    find dist -type f -name "*.html" -o -name "*.js" -o -name "*.css" | head -10
    
    echo "📦 Assets structure:"
    if [ -d "dist/public/assets" ]; then
        echo "✅ Assets directory exists"
        ls -la dist/public/assets/ | head -5
    else
        echo "❌ Assets directory missing"
        echo "Available in dist/public/:"
        ls -la dist/public/ 2>/dev/null || echo "No dist/public directory"
    fi
else
    echo "❌ Project directory not found"
    exit 1
fi

# 2. Check nginx configuration
echo ""
echo "2. Nginx Configuration Check:"
if [ -f "/etc/nginx/sites-available/action-protection" ]; then
    echo "✅ Nginx config exists"
    echo "📄 Assets location in nginx:"
    grep -A 2 "location /assets/" /etc/nginx/sites-available/action-protection
    
    echo "📄 Root location in nginx:"
    grep -A 5 "location / {" /etc/nginx/sites-available/action-protection
else
    echo "❌ Nginx config missing"
fi

# 3. Check PM2 and application
echo ""
echo "3. Application Status Check:"
sudo -u $APP_USER pm2 list | grep action-protection || echo "❌ PM2 process not found"

echo ""
echo "🔧 API Test:"
curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo "✅ API responding" || echo "❌ API not responding"

echo ""
echo "🔧 Direct file access test:"
curl -I http://localhost:4000/ 2>&1 | head -3

echo ""
echo "🔧 Nginx proxy test:"
curl -I http://localhost/ 2>&1 | head -3

# 4. Check server logs
echo ""
echo "4. Server Logs Check:"
if [ -f "$PROJECT_DIR/logs/error.log" ]; then
    echo "📋 Recent errors:"
    tail -10 "$PROJECT_DIR/logs/error.log"
else
    echo "No error log found"
fi

# 5. Check actual file serving
echo ""
echo "5. File Serving Test:"
if [ -f "$PROJECT_DIR/dist/index.js" ]; then
    echo "✅ Server bundle exists"
    echo "📊 Server bundle size: $(du -h $PROJECT_DIR/dist/index.js | cut -f1)"
else
    echo "❌ Server bundle missing"
fi

if [ -f "$PROJECT_DIR/dist/public/index.html" ]; then
    echo "✅ Client index.html exists"
    echo "📄 Index.html content preview:"
    head -5 "$PROJECT_DIR/dist/public/index.html"
else
    echo "❌ Client index.html missing"
fi

echo ""
echo "🎯 Issue Analysis:"
echo "=================="

# Analyze the issue
if [ ! -f "$PROJECT_DIR/dist/public/index.html" ]; then
    echo "❌ ISSUE: Client build missing - index.html not found"
    echo "💡 SOLUTION: Rebuild the application"
elif [ ! -d "$PROJECT_DIR/dist/public/assets" ]; then
    echo "❌ ISSUE: Assets directory missing"
    echo "💡 SOLUTION: Check vite build configuration"
elif ! grep -q "dist/public/assets" /etc/nginx/sites-available/action-protection 2>/dev/null; then
    echo "❌ ISSUE: Nginx pointing to wrong assets path"
    echo "💡 SOLUTION: Update nginx configuration"
elif ! curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "❌ ISSUE: Application not responding"
    echo "💡 SOLUTION: Check PM2 process and restart"
else
    echo "✅ All components appear to be working"
    echo "💡 SOLUTION: May need to clear browser cache or check domain configuration"
fi

echo ""
echo "🔧 Quick Fix Commands:"
echo "======================"
echo "1. Rebuild application: ./emergency-build-fix.sh"
echo "2. Fix nginx config: ./fix-404-issue.sh"
echo "3. Restart services: sudo systemctl restart nginx && sudo -u $APP_USER pm2 restart action-protection"
echo ""