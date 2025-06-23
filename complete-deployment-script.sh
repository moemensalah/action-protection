#!/bin/bash

echo "=== LATELOUNGE COMPLETE DEPLOYMENT SCRIPT ==="

# Variables
DOMAIN="demo2.late-lounge.com"
DB_USER="appuser"
DB_PASSWORD="SAJWJJAHED4E"
DB_NAME="latelounge"
EMAIL="haitham@hmaserv.com"

# Create user and setup directory
sudo useradd -m -s /bin/bash appuser 2>/dev/null || echo "User appuser already exists"
sudo usermod -aG sudo appuser

# Fix critical directory permissions for nginx access
sudo chmod o+x /home/appuser/

# Install dependencies
sudo apt update
sudo apt install -y curl gnupg lsb-release postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PostgreSQL with local connection
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Configure PostgreSQL for local connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
echo "local   all             ${DB_USER}                                md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Clone/setup project
cd /home/appuser
if [ ! -d "latelounge" ]; then
    sudo -u appuser git clone https://github.com/your-repo/latelounge.git || echo "Using existing directory"
fi
cd latelounge

# Install project dependencies
sudo -u appuser npm install

# Setup environment variables
sudo -u appuser tee .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
PGHOST=localhost
PGPORT=5432
PGUSER=${DB_USER}
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=${DB_NAME}
SESSION_SECRET=$(openssl rand -hex 32)
REPL_ID=latelounge-production
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=${DOMAIN}
EOF

# Build the project
sudo -u appuser npm run build

# Create PM2 ecosystem configuration (use .cjs for ES modules)
sudo -u appuser tee ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
sudo -u appuser mkdir -p logs

# Setup uploads directory
sudo -u appuser mkdir -p uploads
sudo chmod 755 uploads

# Fix all file permissions for nginx
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/
sudo find dist/ -type f -exec chmod 644 {} \;

# Generate SSL certificate
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/latelounge.key \
    -out /etc/ssl/certs/latelounge.crt \
    -subj "/C=SA/ST=Riyadh/L=Riyadh/O=LateLounge/CN=${DOMAIN}"

# Create complete Nginx configuration
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

    # Map /assets/ requests to filesystem location
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
        proxy_Set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Fix the typo in nginx config
sudo sed -i 's/proxy_Set_header/proxy_set_header/g' /etc/nginx/sites-available/latelounge

# Enable site and remove default
sudo ln -sf /etc/nginx/sites-available/latelounge /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx

# Setup database schema
sudo -u appuser npm run db:push 2>/dev/null || echo "Database schema already exists"

# Start PM2 application
cd /home/appuser/latelounge
sudo -u appuser pm2 start ecosystem.config.cjs --env production
sudo -u appuser pm2 save
sudo -u appuser pm2 startup | grep -o 'sudo.*' | sudo bash

# Test deployment
echo "Testing deployment..."
sleep 5
curl -I http://localhost:3000/api/categories
curl -I https://${DOMAIN}/assets/index-D9yNFWBb.css

echo "=== DEPLOYMENT COMPLETE ==="
echo "Website available at: https://${DOMAIN}"
echo "API available at: https://${DOMAIN}/api/categories"
echo ""
echo "To manage the application:"
echo "sudo -u appuser pm2 status"
echo "sudo -u appuser pm2 logs"
echo "sudo -u appuser pm2 restart latelounge"