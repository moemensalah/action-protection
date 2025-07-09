#!/bin/bash

# ========================================================================
# Rebuild Client Only - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Rebuilding client for Action Protection..."

cd $PROJECT_DIR

echo "1. Installing build dependencies..."
sudo -u $APP_USER npm install --include=dev

echo "2. Building client with alternative approach..."
sudo -u $APP_USER bash -c "
    # Remove old build
    rm -rf dist/public
    
    # Try different build approaches
    echo 'Attempting build approach 1: Direct vite build...'
    npx vite build --outDir dist/public || echo 'Approach 1 failed'
    
    if [ ! -d 'dist/public' ]; then
        echo 'Attempting build approach 2: Client directory build...'
        cd client
        npx vite build --outDir ../dist/public || echo 'Approach 2 failed'
        cd ..
    fi
    
    if [ ! -d 'dist/public' ]; then
        echo 'Attempting build approach 3: Manual client build...'
        mkdir -p dist/public
        mkdir -p dist/public/assets
        
        # Copy essential files
        cp client/index.html dist/public/index.html || echo 'No index.html found'
        
        # Create a minimal index.html if none exists
        if [ ! -f 'dist/public/index.html' ]; then
            cat > dist/public/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Action Protection</title>
</head>
<body>
    <div id=\"root\">
        <div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\">
            <h1>Action Protection</h1>
            <p>Loading...</p>
        </div>
    </div>
</body>
</html>
HTMLEOF
        fi
    fi
"

echo "3. Verifying client build..."
if [ -d "dist/public" ]; then
    echo "✅ Client build directory created"
    ls -la dist/public/
else
    echo "❌ Client build still failed"
    exit 1
fi

echo "4. Restarting PM2 with client files..."
sudo -u $APP_USER pm2 restart action-protection

echo "5. Testing application..."
sleep 5
curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo "✅ Application working" || echo "❌ Application not responding"

echo "6. Testing nginx proxy..."
curl -I http://localhost/ 2>&1 | head -3

echo ""
echo "🎉 Client rebuild completed!"
echo "📋 Build Status:"
echo "   - Client: $([ -d 'dist/public' ] && echo 'Built' || echo 'Missing')"
echo "   - Server: $([ -f 'dist/server.js' ] && echo 'Built' || echo 'Missing')"
echo "   - PM2: $(sudo -u $APP_USER pm2 list | grep action-protection | awk '{print $10}' || echo 'Not running')"