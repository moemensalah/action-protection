#!/bin/bash

# ========================================================================
# Quick Fix Nginx Configuration - Action Protection
# ========================================================================

echo "🔧 Quick nginx configuration fix for 404 issue..."

# Update nginx configuration with correct paths
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

    # Static files from dist/public
    location /assets/ {
        alias /home/actionprotection/action-protection/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Uploads directory
    location /uploads/ {
        alias /home/actionprotection/action-protection/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # API routes - proxy to Node.js app
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

    # Main application - serve everything through Node.js for SPA routing
    location / {
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

echo "✅ Nginx configuration updated"

# Test and reload nginx
echo "🔧 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration valid"
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx configuration invalid"
    exit 1
fi

# Test the application
echo "🔧 Testing application..."
sleep 2

echo "📋 Testing API endpoint..."
curl -f http://localhost:4000/api/categories > /dev/null 2>&1 && echo "✅ API working" || echo "❌ API not responding"

echo "📋 Testing nginx proxy..."
curl -I http://localhost/ 2>&1 | head -3

echo ""
echo "🎉 Nginx configuration fix completed!"
echo "📍 Your website should now be accessible at: http://demox.actionprotectionkw.com"
echo ""
echo "If still having issues, run: ./diagnose-404-issue.sh"