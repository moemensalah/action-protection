#!/bin/bash

echo "=== COMPLETE NGINX ASSET FIX ==="

# Create a working Nginx configuration that serves assets correctly
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

    # Set document root
    root /home/appuser/latelounge/dist/public;
    index index.html;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upload size limit
    client_max_body_size 10M;

    # Serve static assets with proper MIME types
    location /assets/ {
        root /home/appuser/latelounge/dist/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Explicitly set MIME types
        location ~* \.css$ {
            add_header Content-Type text/css;
        }
        location ~* \.js$ {
            add_header Content-Type application/javascript;
        }
    }

    # Serve favicon and other static files
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes go to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Uploads directory
    location /uploads/ {
        alias /home/appuser/latelounge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else tries static files first, then Node.js
    location / {
        try_files $uri $uri/ @nodejs;
    }

    # Fallback to Node.js for dynamic routes
    location @nodejs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
}
EOF

# Test configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx config valid, reloading..."
    sudo systemctl reload nginx
    
    # Fix permissions
    sudo chown -R www-data:www-data /home/appuser/latelounge/dist/
    sudo chmod -R 755 /home/appuser/latelounge/dist/
    
    echo "Testing asset serving..."
    curl -I http://localhost/assets/index-D9yNFWBb.css
    curl -I http://localhost/assets/index-Db2z8t11.js
    
    echo "Testing HTTPS assets..."
    curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css
    curl -I https://demo2.late-lounge.com/assets/index-Db2z8t11.js
    
else
    echo "Nginx configuration failed!"
    sudo nginx -t
fi

echo "=== COMPLETE NGINX FIX DONE ==="