#!/bin/bash

echo "=== FIXING NGINX DIRECT ASSET SERVING ==="

# Create corrected Nginx configuration with proper asset handling
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

    # Root directory for static files
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

    # Serve static assets directly (CSS, JS, images)
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Serve uploads directory
    location /uploads/ {
        alias /home/appuser/latelounge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes - proxy to Node.js
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

    # Handle client-side routing - try file first, then proxy to Node.js
    location / {
        try_files $uri $uri/ @proxy;
    }

    # Proxy fallback for dynamic routes
    location @proxy {
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

# Test and reload Nginx
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "Checking file permissions..."
    sudo chown -R www-data:www-data /home/appuser/latelounge/dist/public/
    sudo chmod -R 755 /home/appuser/latelounge/dist/public/
    
    echo "Testing asset access..."
    curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css
    curl -I https://demo2.late-lounge.com/assets/index-Db2z8t11.js
else
    echo "Nginx configuration error!"
fi

echo "=== NGINX DIRECT ASSET FIX COMPLETE ==="