#!/bin/bash

# Setup nginx for Action Protection production server
echo "🌐 Setting up nginx for Action Protection"
echo "========================================"

# Update package list and install nginx
apt update
apt install -y nginx

# Create nginx configuration
cat > /etc/nginx/sites-available/action-protection << 'EOF'
server {
    listen 80;
    server_name demox.actionprotectionkw.com www.demox.actionprotectionkw.com;
    
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
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @app;
    }
    
    # API routes
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
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Main application (proxy all other requests to Node.js)
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
        proxy_read_timeout 86400;
    }
    
    # Fallback for static files
    location @app {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/action-protection /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🔧 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx configuration valid"
    
    # Start and enable nginx
    systemctl restart nginx
    systemctl enable nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ nginx is running successfully"
        
        # Check if application is responding
        if curl -s http://localhost:4000/api/contact >/dev/null 2>&1; then
            echo "✅ Application is responding on port 4000"
            echo "🌐 Your website should now be accessible at:"
            echo "   - http://demox.actionprotectionkw.com"
            echo "   - http://www.demox.actionprotectionkw.com"
        else
            echo "❌ Application is not responding on port 4000"
            echo "Check if PM2 is running: pm2 status"
        fi
    else
        echo "❌ nginx failed to start"
        systemctl status nginx
    fi
else
    echo "❌ nginx configuration test failed"
fi

echo ""
echo "🔧 nginx Management Commands:"
echo "   systemctl status nginx"
echo "   systemctl restart nginx"
echo "   nginx -t"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo "📁 Configuration file: /etc/nginx/sites-available/action-protection"