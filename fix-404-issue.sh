#!/bin/bash

# ========================================================================
# Fix 404 Issue - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Diagnosing 404 issue for Action Protection..."

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

echo "1. Checking build outputs..."
if [ -f "dist/index.js" ]; then
    echo "✅ Server build exists ($(du -h dist/index.js | cut -f1))"
else
    echo "❌ Server build missing"
fi

if [ -d "dist/public" ]; then
    echo "✅ Client build directory exists"
    echo "📁 Client build contents:"
    ls -la dist/public/
else
    echo "❌ Client build directory missing"
    echo "📁 Available dist contents:"
    ls -la dist/ || echo "No dist directory"
fi

echo "2. Checking nginx configuration..."
if [ -f "/etc/nginx/sites-available/action-protection" ]; then
    echo "✅ Nginx config exists"
    echo "📄 Current nginx config:"
    grep -A 10 "location /" /etc/nginx/sites-available/action-protection
else
    echo "❌ Nginx config missing"
fi

echo "3. Checking PM2 status..."
sudo -u $APP_USER pm2 list

echo "4. Testing direct application access..."
curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo "✅ API working" || echo "❌ API not responding"

echo "5. Testing nginx proxy..."
curl -I http://localhost/ 2>&1 | head -5 || echo "❌ Nginx proxy not working"

echo "6. Checking static file structure..."
if [ -f "dist/public/index.html" ]; then
    echo "✅ index.html exists"
    echo "📄 First few lines of index.html:"
    head -5 dist/public/index.html
else
    echo "❌ index.html missing"
fi

echo "7. Fixing static file paths in nginx..."
sudo tee /etc/nginx/sites-available/action-protection << 'EOF'
server {
    listen 80;
    server_name demox.actionprotectionkw.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Static files - serve directly from dist/public
    location /assets/ {
        alias /home/actionprotection/action-protection/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads directory
    location /uploads/ {
        alias /home/actionprotection/action-protection/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes - proxy to application
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Main application - serve index.html for all routes (SPA)
    location / {
        try_files $uri $uri/ @fallback;
    }

    # Fallback to application for SPA routing
    location @fallback {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

echo "8. Testing and reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "9. Testing website access..."
sleep 2
curl -I http://localhost/ 2>&1 | head -5

echo "10. Final verification..."
echo "🔍 Application should now be accessible at:"
echo "   - http://demox.actionprotectionkw.com"
echo "   - http://localhost (if testing locally)"
echo ""
echo "📋 Status summary:"
echo "   - PM2: $(sudo -u $APP_USER pm2 list | grep action-protection | awk '{print $10}' || echo 'Not running')"
echo "   - Nginx: $(sudo systemctl is-active nginx)"
echo "   - API: $(curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo 'Working' || echo 'Not responding')"