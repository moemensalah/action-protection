#!/bin/bash

#===========================================
# CONFIGURATION VARIABLES - EDIT THESE
#===========================================

# Domain Configuration
DOMAIN_NAME="yourdomain.com"
WWW_DOMAIN="www.yourdomain.com"

# Database Configuration
DB_NAME="latelounge_db"
DB_USER="appuser"
DB_PASSWORD="your_secure_password_here_change_this"

# Application Configuration
APP_NAME="latelounge"
APP_USER="appuser"
APP_PORT="3000"
GIT_REPO="https://github.com/yourusername/your-repo.git"

# Security Configuration
SESSION_SECRET="your_very_long_random_session_secret_minimum_32_characters_change_this"
REPL_ID="your_repl_id_here"

# Email for SSL Certificate
SSL_EMAIL="your-email@example.com"

#===========================================
# DO NOT EDIT BELOW THIS LINE
#===========================================

set -e  # Exit on any error

echo "🚀 Starting automated deployment for $APP_NAME..."
echo "📋 Domain: $DOMAIN_NAME"
echo "📋 Database: $DB_NAME"
echo "📋 App User: $APP_USER"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Create a sudo user first."
    exit 1
fi

print_step "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_step "2. Installing essential tools..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop

print_step "3. Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

print_step "4. Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

print_step "5. Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_step "6. Setting up database..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

print_step "7. Installing PM2..."
sudo npm install -g pm2

print_step "8. Setting up PM2 startup..."
PM2_STARTUP_CMD=$(pm2 startup | tail -n 1)
if [[ $PM2_STARTUP_CMD == sudo* ]]; then
    eval $PM2_STARTUP_CMD
fi

print_step "9. Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_step "10. Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

print_step "11. Cloning application repository..."
cd /home/$APP_USER
if [ -d "$APP_NAME" ]; then
    print_warning "Directory $APP_NAME already exists. Removing..."
    rm -rf $APP_NAME
fi
git clone $GIT_REPO $APP_NAME
cd $APP_NAME

print_step "12. Installing application dependencies..."
npm install

print_step "13. Creating environment file..."
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
SESSION_SECRET=$SESSION_SECRET
REPLIT_DOMAINS=$DOMAIN_NAME,$WWW_DOMAIN
ISSUER_URL=https://replit.com/oidc
REPL_ID=$REPL_ID
PORT=$APP_PORT
EOF

print_step "14. Building application..."
npm run build

print_step "15. Setting up database schema..."
npm run db:push

print_step "16. Creating logs directory..."
mkdir -p logs

print_step "17. Creating PM2 ecosystem config..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

print_step "18. Starting application with PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

print_step "19. Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME $WWW_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME $WWW_DOMAIN;

    # SSL configuration will be added by Certbot

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upload size limit
    client_max_body_size 10M;

    # Serve static files
    location /uploads/ {
        alias /home/$APP_USER/$APP_NAME/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Serve static assets
    location /assets/ {
        alias /home/$APP_USER/$APP_NAME/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
    }
}
EOF

print_step "20. Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

print_step "21. Testing Nginx configuration..."
sudo nginx -t

print_step "22. Restarting Nginx..."
sudo systemctl restart nginx

print_step "23. Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN_NAME -d $WWW_DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL

print_step "24. Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_step "25. Creating backup directory..."
mkdir -p /home/$APP_USER/backups

print_step "26. Creating database backup script..."
cat > /home/$APP_USER/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U $DB_USER -d $DB_NAME > /home/$APP_USER/backups/backup_\$DATE.sql
find /home/$APP_USER/backups -name "backup_*.sql" -mtime +7 -delete
EOF
chmod +x /home/$APP_USER/backup-db.sh

print_step "27. Creating update script..."
cat > /home/$APP_USER/update-app.sh << EOF
#!/bin/bash
cd /home/$APP_USER/$APP_NAME

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Running database migrations..."
npm run db:push

echo "Restarting PM2..."
pm2 restart latelounge

echo "Deployment complete!"
EOF
chmod +x /home/$APP_USER/update-app.sh

print_step "28. Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$APP_USER/backup-db.sh") | crontab -

print_step "29. Installing security tools..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

print_step "30. Setting correct permissions..."
sudo chown -R $APP_USER:$APP_USER /home/$APP_USER/$APP_NAME
chmod 755 /home/$APP_USER/$APP_NAME/uploads 2>/dev/null || mkdir -p /home/$APP_USER/$APP_NAME/uploads && chmod 755 /home/$APP_USER/$APP_NAME/uploads

print_step "31. Final system check..."
echo ""
echo "🔍 Checking services status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    echo -e "✅ PostgreSQL: ${GREEN}Running${NC}"
else
    echo -e "❌ PostgreSQL: ${RED}Not Running${NC}"
fi

# Check Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "✅ Nginx: ${GREEN}Running${NC}"
else
    echo -e "❌ Nginx: ${RED}Not Running${NC}"
fi

# Check PM2 Application
if pm2 describe $APP_NAME &>/dev/null; then
    echo -e "✅ Application ($APP_NAME): ${GREEN}Running${NC}"
else
    echo -e "❌ Application ($APP_NAME): ${RED}Not Running${NC}"
fi

# Check SSL Certificate
if curl -s https://$DOMAIN_NAME &>/dev/null; then
    echo -e "✅ SSL Certificate: ${GREEN}Working${NC}"
else
    echo -e "❌ SSL Certificate: ${RED}Not Working${NC}"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 DEPLOYMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Website URL: https://$DOMAIN_NAME"
echo "🗄️  Database: $DB_NAME"
echo "👤 App User: $APP_USER"
echo "🔧 App Directory: /home/$APP_USER/$APP_NAME"
echo ""
echo "📋 USEFUL COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "View logs: pm2 logs $APP_NAME"
echo "Restart app: pm2 restart $APP_NAME"
echo "Update app: ./update-app.sh"
echo "Backup DB: ./backup-db.sh"
echo "Check status: pm2 status"
echo ""
echo "📋 LOG FILES LOCATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "App logs: /home/$APP_USER/$APP_NAME/logs/"
echo "Nginx logs: /var/log/nginx/"
echo "System logs: journalctl -u nginx -f"
echo ""
print_warning "IMPORTANT: Make sure your domain DNS is pointing to this server's IP address!"
print_warning "SECURITY: Change the default passwords in the .env file!"
echo ""
echo "🚀 Your application should now be accessible at: https://$DOMAIN_NAME"