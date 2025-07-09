# Complete Production Deployment Instructions

## Overview
This guide provides step-by-step instructions for deploying Action Protection to production with automatic database setup and import.

## Prerequisites
- Ubuntu 20.04+ server
- Root or sudo access
- Domain name configured (demox.actionprotectionkw.com)
- Project files in current directory

## Quick Deployment (Recommended)

### 1. Upload Files to Server
```bash
# Copy all project files to your server
scp -r . root@your-server-ip:/root/action-protection-deploy/
```

### 2. Run Complete Deployment Script
```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to project directory
cd /root/action-protection-deploy/

# Make script executable and run
chmod +x complete-production-deployment.sh
sudo ./complete-production-deployment.sh
```

## What the Script Does

### System Setup
- ✅ Installs Node.js 20, PM2, PostgreSQL, and Nginx
- ✅ Creates dedicated `actionprotection` user
- ✅ Configures system dependencies

### Database Setup
- ✅ Creates PostgreSQL database `actionprotection_db`
- ✅ Creates database user with proper permissions
- ✅ Imports complete database structure and data
- ✅ Includes admin user and sample data

### Application Setup
- ✅ Copies project files to `/home/actionprotection/action-protection`
- ✅ Installs dependencies and builds application
- ✅ Creates production environment configuration
- ✅ Sets up PM2 process management

### Web Server Setup
- ✅ Configures Nginx reverse proxy
- ✅ Sets up SSL-ready configuration
- ✅ Enables gzip compression and security headers
- ✅ Configures static file serving

### Security Setup
- ✅ Configures UFW firewall
- ✅ Sets up proper file permissions
- ✅ Enables security headers

## Post-Deployment

### Access Information
- **Website**: http://demox.actionprotectionkw.com
- **Admin Panel**: http://demox.actionprotectionkw.com/admin
- **Direct App**: http://localhost:4000

### Admin Credentials
- **Email**: admin@actionprotection.com
- **Password**: admin123456

### Management Commands
```bash
# Check application status
sudo -u actionprotection pm2 list

# View application logs
sudo -u actionprotection pm2 logs action-protection

# Restart application
sudo -u actionprotection pm2 restart action-protection

# Stop application
sudo -u actionprotection pm2 stop action-protection

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# Access database
psql "postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db"
```

## Database Information

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: actionprotection_db
- **Username**: actionprotection
- **Password**: ajHQGHgwqhg3ggagdg

### Database Structure
The script creates and populates:
- 15+ tables with complete schema
- Admin user with proper permissions
- 5 product categories
- 5+ sample products
- Content management data
- Configuration settings

## SSL Setup (Optional)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d demox.actionprotectionkw.com
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   ```bash
   sudo -u actionprotection pm2 logs action-protection
   sudo systemctl status nginx
   ```

2. **Database Connection Issues**
   ```bash
   sudo systemctl status postgresql
   psql "postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db" -c "SELECT 1;"
   ```

3. **Permission Issues**
   ```bash
   sudo chown -R actionprotection:actionprotection /home/actionprotection/action-protection
   ```

4. **Port Issues**
   ```bash
   sudo netstat -tulpn | grep :4000
   sudo lsof -i :4000
   ```

### Log Locations
- **Application Logs**: `/home/actionprotection/action-protection/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`

## Backup Strategy

### Database Backup
```bash
pg_dump "postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db" > backup_$(date +%Y%m%d).sql
```

### Application Backup
```bash
tar -czf backup_$(date +%Y%m%d).tar.gz -C /home/actionprotection action-protection --exclude=node_modules --exclude=.git
```

## Maintenance

### Update Application
```bash
cd /home/actionprotection/action-protection
sudo -u actionprotection git pull origin main
sudo -u actionprotection npm install --production
sudo -u actionprotection npm run build
sudo -u actionprotection pm2 restart action-protection
```

### Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Monitor PM2 processes
sudo -u actionprotection pm2 monit
```

## Support

The deployment script includes comprehensive error handling and testing. If you encounter issues:

1. Check the script output for specific error messages
2. Review the log files mentioned above
3. Verify system requirements are met
4. Ensure domain DNS is properly configured

## Success Indicators

After successful deployment, you should see:
- ✅ PM2 process running
- ✅ Nginx service active
- ✅ Database responding
- ✅ Admin login working
- ✅ API endpoints responding
- ✅ Website accessible via domain

The script automatically tests all these components and reports success/failure status.