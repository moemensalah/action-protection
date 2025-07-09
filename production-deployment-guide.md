# Production Deployment Guide - Action Protection

## Overview
This guide shows the best way to deploy the Action Protection automotive platform on an Ubuntu production server using local PostgreSQL database.

## Prerequisites
- Ubuntu 20.04+ server
- Root or sudo access
- Domain name configured (demox.actionprotectionkw.com)
- Cloudflare DNS setup

## 1. System Setup

### Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y

# Install other dependencies
sudo apt install git curl wget unzip -y
```

### Create Application User
```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash actionprotection
sudo usermod -aG sudo actionprotection

# Switch to application user
sudo su - actionprotection
```

## 2. Database Setup

### Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE actionprotection_db;
CREATE USER actionprotection WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE actionprotection_db TO actionprotection;
ALTER USER actionprotection CREATEDB;
\q
```

### Database Connection String
```bash
# Set environment variable
export DATABASE_URL="postgresql://actionprotection:your_secure_password_here@localhost:5432/actionprotection_db"
```

## 3. Application Deployment

### Clone or Copy Project Files
```bash
# Option A: Git clone (if you have repository)
git clone https://github.com/your-repo/action-protection.git /home/actionprotection/action-protection

# Option B: Copy files from development
# Copy your project files to /home/actionprotection/action-protection
```

### Install Dependencies
```bash
cd /home/actionprotection/action-protection
npm install --production
```

### Database Migration
```bash
# Run database migrations
npm run db:push

# Seed initial data (if needed)
npm run seed
```

### Build Application
```bash
# Build production assets
npm run build
```

## 4. PM2 Configuration

### Create PM2 Ecosystem File
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '/home/actionprotection/action-protection',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://actionprotection:your_secure_password_here@localhost:5432/actionprotection_db'
    },
    error_file: '/home/actionprotection/logs/error.log',
    out_file: '/home/actionprotection/logs/out.log',
    log_file: '/home/actionprotection/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    restart_delay: 5000
  }]
};
```

### Start Application
```bash
# Create logs directory
mkdir -p /home/actionprotection/logs

# Start with PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by PM2
```

## 5. Nginx Configuration

### Create Nginx Site Configuration
```nginx
# /etc/nginx/sites-available/action-protection
server {
    listen 80;
    server_name demox.actionprotectionkw.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Main application proxy
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
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Static files
    location /uploads/ {
        alias /home/actionprotection/action-protection/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /assets/ {
        alias /home/actionprotection/action-protection/client/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
```

### Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/action-protection /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 6. SSL Certificate (Optional)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d demox.actionprotectionkw.com
```

## 7. Create Admin User

### Direct Database Insert
```sql
-- Connect to database
sudo -u postgres psql -d actionprotection_db

-- Create admin user
INSERT INTO users (
    id, 
    email, 
    username, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'admin_user_' || extract(epoch from now()),
    'admin@actionprotection.com',
    'admin',
    '$2b$12$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
);
```

## 8. Monitoring and Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs action-protection

# Restart application
pm2 restart action-protection

# Stop application
pm2 stop action-protection

# Monitor resources
pm2 monit
```

### Database Maintenance
```bash
# Backup database
pg_dump -U actionprotection actionprotection_db > backup_$(date +%Y%m%d).sql

# Check database size
sudo -u postgres psql -d actionprotection_db -c "SELECT pg_size_pretty(pg_database_size('actionprotection_db'));"
```

### Log Rotation
```bash
# Install logrotate configuration
sudo tee /etc/logrotate.d/action-protection << 'EOF'
/home/actionprotection/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 actionprotection actionprotection
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 9. Firewall Configuration

### UFW Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Allow application port (if needed)
sudo ufw allow 4000

# Check status
sudo ufw status
```

## 10. Environment Variables

### Create .env File
```bash
# /home/actionprotection/action-protection/.env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://actionprotection:your_secure_password_here@localhost:5432/actionprotection_db
SESSION_SECRET=your_session_secret_here
```

## 11. Deployment Script

### Automated Deployment
```bash
#!/bin/bash
# deploy.sh

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "Starting deployment..."

# Pull latest code
cd $PROJECT_DIR
git pull origin main

# Install dependencies
npm install --production

# Build application
npm run build

# Run migrations
npm run db:push

# Restart PM2
pm2 restart action-protection

# Wait for startup
sleep 10

# Test application
curl -f http://localhost:4000/api/categories > /dev/null && echo "✅ Application is running" || echo "❌ Application failed to start"

echo "Deployment completed!"
```

## 12. Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if app is running: `pm2 status`
   - Check logs: `pm2 logs action-protection`
   - Verify port 4000: `netstat -tulpn | grep :4000`

2. **Database Connection Issues**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

3. **Permission Issues**
   - Ensure correct file ownership: `chown -R actionprotection:actionprotection /home/actionprotection/action-protection`
   - Check directory permissions: `chmod 755 /home/actionprotection/action-protection`

### Health Check Commands
```bash
# Application health
curl -f http://localhost:4000/api/categories

# Database health
sudo -u postgres psql -d actionprotection_db -c "SELECT COUNT(*) FROM users;"

# System resources
free -h
df -h
```

## 13. Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/actionprotection/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U actionprotection actionprotection_db > "$BACKUP_DIR/db_$DATE.sql"

# Files backup
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C /home/actionprotection action-protection --exclude=node_modules --exclude=.git

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Cron Job for Backups
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/actionprotection/backup.sh
```

## Default Credentials

- **Admin Panel**: https://demox.actionprotectionkw.com/admin
- **Email**: admin@actionprotection.com
- **Password**: admin123456

## Summary

This production setup provides:
- ✅ Local PostgreSQL database
- ✅ PM2 process management
- ✅ Nginx reverse proxy
- ✅ SSL certificate support
- ✅ Automated backups
- ✅ Log rotation
- ✅ Health monitoring
- ✅ Security headers
- ✅ Error handling

The application will run reliably on your Ubuntu server with proper database persistence and admin access.