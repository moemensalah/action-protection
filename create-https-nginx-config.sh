#!/bin/bash

echo "=== CREATING HTTPS NGINX CONFIGURATION ==="

# Create SSL certificate directory
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private

# Generate self-signed certificate for HTTPS (Cloudflare handles actual SSL)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/latelounge.key \
    -out /etc/ssl/certs/latelounge.crt \
    -subj "/C=SA/ST=Riyadh/L=Riyadh/O=LateLounge/CN=demo2.late-lounge.com"

# Create complete Nginx configuration with both HTTP and HTTPS
sudo tee /etc/nginx/sites-available/latelounge << 'EOF'
# HTTP server (redirects to HTTPS)
server {
    listen 80;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name demo2.late-lounge.com www.demo2.late-lounge.com;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/latelounge.crt;
    ssl_certificate_key /etc/ssl/private/latelounge.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

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

# Test both HTTP and HTTPS
echo "Testing HTTPS asset serving:"
curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css

echo "=== HTTPS NGINX CONFIGURATION COMPLETE ==="