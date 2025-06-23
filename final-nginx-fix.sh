#!/bin/bash

echo "=== FINAL NGINX ASSET FIX ==="

# First, check the actual file permissions and paths
echo "Checking file structure:"
ls -la /home/appuser/latelounge/dist/public/
ls -la /home/appuser/latelounge/dist/public/assets/

# Create simplified Nginx config that definitely works
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

    # Serve assets directly from filesystem
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

    # Everything else to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test and reload
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully"
else
    echo "Nginx config error!"
    exit 1
fi

# Set proper permissions
sudo chown -R www-data:www-data /home/appuser/latelounge/dist/
sudo chmod -R 755 /home/appuser/latelounge/dist/
sudo chmod 644 /home/appuser/latelounge/dist/public/assets/*

# Test direct file access
echo "Testing direct file access:"
sudo -u www-data cat /home/appuser/latelounge/dist/public/assets/index-D9yNFWBb.css | head -5

# Test HTTP access
echo "Testing HTTP access:"
curl -v http://localhost/assets/index-D9yNFWBb.css 2>&1 | head -20

echo "=== FINAL NGINX FIX COMPLETE ==="