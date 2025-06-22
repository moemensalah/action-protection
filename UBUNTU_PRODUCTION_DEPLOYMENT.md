# Complete Ubuntu 22.04 Production Deployment Guide

## Prerequisites
- Fresh Ubuntu 22.04 server
- Root or sudo access
- Domain name (optional but recommended)
- Server with at least 2GB RAM

## Step 1: Initial Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### Create Application User (Security Best Practice)
```bash
sudo adduser appuser
sudo usermod -aG sudo appuser
su - appuser
```

## Step 2: Install Node.js 20

### Install Node.js via NodeSource Repository
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify Installation
```bash
node --version  # Should show v20.x.x
npm --version   # Should show latest npm
```

## Step 3: Install PostgreSQL

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Start and Enable PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Setup Database
```bash
sudo -u postgres psql
```

In PostgreSQL console:
```sql
CREATE DATABASE latelounge_db;
CREATE USER appuser WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE latelounge_db TO appuser;
ALTER USER appuser CREATEDB;
\q
```

## Step 4: Install PM2 (Process Manager)

### Install PM2 Globally
```bash
sudo npm install -g pm2
```

### Setup PM2 to Start on Boot
```bash
pm2 startup
# Follow the instructions shown (will give you a command to run with sudo)
```

## Step 5: Install Nginx (Reverse Proxy)

### Install Nginx
```bash
sudo apt install -y nginx
```

### Start and Enable Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 6: Setup SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate (Replace yourdomain.com)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 7: Deploy Your Application

### Clone Your Repository
```bash
cd /home/appuser
git clone https://github.com/yourusername/your-repo.git latelounge
cd latelounge
```

### Install Dependencies
```bash
npm install
```

### Create Environment File
```bash
nano .env
```

Add these environment variables:
```env
NODE_ENV=production
DATABASE_URL=postgresql://appuser:your_secure_password_here@localhost:5432/latelounge_db
SESSION_SECRET=your_very_long_random_session_secret_here
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id_here
PORT=3000
```

### Build the Application
```bash
npm run build
```

### Setup Database Schema
```bash
npm run db:push
```

### Seed Database (If you have seed data)
```bash
npm run db:seed
```

## Step 8: Configure PM2

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
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
    time: true
  }]
};
```

### Create Logs Directory
```bash
mkdir logs
```

### Start Application with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

## Step 9: Configure Nginx

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/latelounge
```

Add this configuration (replace yourdomain.com):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upload size limit
    client_max_body_size 10M;

    # Serve static files
    location /uploads/ {
        alias /home/appuser/latelounge/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Serve static assets
    location /assets/ {
        alias /home/appuser/latelounge/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
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
```

### Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/latelounge /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### Test Nginx Configuration
```bash
sudo nginx -t
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Step 10: Setup Firewall

### Configure UFW Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Step 11: Create Deployment Script

### Create Update Script
```bash
nano update-app.sh
```

Add this content:
```bash
#!/bin/bash
cd /home/appuser/latelounge

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
```

### Make Script Executable
```bash
chmod +x update-app.sh
```

## Step 12: Monitoring and Maintenance

### View Application Logs
```bash
pm2 logs latelounge
```

### Check Application Status
```bash
pm2 status
pm2 monit
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup Script
```bash
nano backup-db.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U appuser -d latelounge_db > /home/appuser/backups/backup_$DATE.sql
find /home/appuser/backups -name "backup_*.sql" -mtime +7 -delete
```

### Create Backup Directory and Schedule
```bash
mkdir /home/appuser/backups
chmod +x backup-db.sh
crontab -e
```

Add this line to run backup daily at 2 AM:
```bash
0 2 * * * /home/appuser/backup-db.sh
```

## Step 13: SSL Certificate Auto-Renewal

### Test Certificate Renewal
```bash
sudo certbot renew --dry-run
```

The renewal should be automatic, but you can add a cron job:
```bash
sudo crontab -e
```

Add this line:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### If Application Won't Start
```bash
# Check PM2 logs
pm2 logs latelounge

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Restart PM2
pm2 restart latelounge
```

### If Database Connection Fails
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U appuser -d latelounge_db
```

### If Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### File Permissions Issues
```bash
# Fix ownership
sudo chown -R appuser:appuser /home/appuser/latelounge

# Fix upload directory permissions
chmod 755 /home/appuser/latelounge/uploads
```

## Security Hardening

### Disable Root SSH Login
```bash
sudo nano /etc/ssh/sshd_config
```

Change `PermitRootLogin` to `no`, then:
```bash
sudo systemctl restart ssh
```

### Setup Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates
```bash
# Add to weekly cron
sudo crontab -e
```

Add:
```bash
0 4 * * 0 apt update && apt upgrade -y
```

## Final Checklist

- [ ] Application starts without errors
- [ ] Database connections work
- [ ] SSL certificate is installed and working
- [ ] File uploads work correctly
- [ ] All pages load properly
- [ ] Admin panel is accessible
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Firewall is configured
- [ ] Domain points to server IP

Your application should now be running in production at https://yourdomain.com

## Quick Commands Reference

```bash
# Restart application
pm2 restart latelounge

# View logs
pm2 logs latelounge

# Update application
./update-app.sh

# Check system status
sudo systemctl status nginx postgresql

# Monitor resources
htop
df -h
```