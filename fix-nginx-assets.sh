#!/bin/bash

echo "=== FIXING NGINX ASSETS CONFIGURATION ==="

# Update Nginx configuration to properly serve assets
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

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

    # Serve static assets directly with proper MIME types
    location /assets/ {
        alias /home/appuser/latelounge/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Ensure proper MIME types
        location ~* \.css$ {
            add_header Content-Type text/css;
        }
        location ~* \.js$ {
            add_header Content-Type application/javascript;
        }
    }

    # Serve uploads directory
    location /uploads/ {
        alias /home/appuser/latelounge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application (proxy everything else to Node.js)
    location / {
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
sudo nginx -t && sudo systemctl reload nginx

echo "Nginx configuration updated. Testing assets..."

# Test asset access
curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css
curl -I https://demo2.late-lounge.com/assets/index-Db2z8t11.js

echo "=== NGINX ASSETS FIX COMPLETE ==="