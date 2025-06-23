#!/bin/bash

echo "=== FIXING NGINX PATH MAPPING ==="

# Create corrected Nginx configuration that maps /assets/ to /public/assets/
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

    # Map /assets/ requests to the actual filesystem location
    location /assets/ {
        alias /home/appuser/latelounge/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Serve uploads
    location /uploads/ {
        alias /home/appuser/latelounge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API routes to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Everything else to Node.js (including main HTML page)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Test the corrected mapping
echo "Testing corrected asset mapping:"
curl -I http://localhost/assets/index-D9yNFWBb.css
curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css

echo "=== NGINX PATH MAPPING FIX COMPLETE ==="