# Action Protection Webserver Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Run the Diagnostic Script
```bash
./diagnose-webserver.sh
```
This will provide a comprehensive report of all system components.

### 2. Check Application Status
```bash
# Check if app is running on port 4000
curl -I http://localhost:4000

# Check API endpoint
curl http://localhost:4000/api/contact

# Check PM2 processes
sudo -u actionprotection pm2 status
sudo -u actionprotection pm2 logs action-protection
```

### 3. Check nginx Status
```bash
# Check nginx service
systemctl status nginx

# Test nginx configuration
nginx -t

# Check nginx logs
journalctl -u nginx -n 20
```

### 4. Check Network Connectivity
```bash
# Check what's using port 4000
lsof -i:4000

# Check all listening ports
netstat -tuln | grep LISTEN

# Test external access
curl -I http://demox.actionprotectionkw.com
```

## Common Issues and Solutions

### Issue 1: "webserver down" - Application Not Running
**Symptoms:** nginx shows "webserver down" or connection refused

**Solutions:**
```bash
# Restart the application
sudo -u actionprotection pm2 restart action-protection

# If PM2 process doesn't exist, start it
sudo -u actionprotection pm2 start ecosystem.config.cjs --env production

# Check application logs
sudo -u actionprotection pm2 logs action-protection --lines 50
```

### Issue 2: nginx Not Running
**Symptoms:** Cannot connect to port 80, nginx service inactive

**Solutions:**
```bash
# Start nginx
systemctl start nginx
systemctl enable nginx

# If configuration is invalid, fix it
nginx -t
./setup-nginx.sh

# Restart nginx
systemctl restart nginx
```

### Issue 3: Port 4000 Not Accessible
**Symptoms:** Application runs but can't connect to port 4000

**Solutions:**
```bash
# Check if process is running
ps aux | grep node

# Check PM2 status
sudo -u actionprotection pm2 status

# Kill any conflicting processes
sudo lsof -ti:4000 | xargs sudo kill -9

# Restart application
sudo -u actionprotection pm2 restart action-protection
```

### Issue 4: Database Connection Issues
**Symptoms:** Application starts but API calls fail

**Solutions:**
```bash
# Check database connection
sudo -u postgres psql -d actionprotection_db -c "SELECT 1;"

# Check database service
systemctl status postgresql

# Restart database
systemctl restart postgresql
```

### Issue 5: Build Issues
**Symptoms:** Application doesn't start, missing files

**Solutions:**
```bash
# Navigate to project directory
cd /home/actionprotection/action-protection

# Rebuild application
sudo -u actionprotection npm run build

# Check for missing files
ls -la dist/
```

### Issue 6: Permission Issues
**Symptoms:** Cannot write files, permission denied errors

**Solutions:**
```bash
# Fix ownership
chown -R actionprotection:actionprotection /home/actionprotection/action-protection

# Fix permissions
chmod -R 755 /home/actionprotection/action-protection
```

## Complete Restart Process

If all else fails, restart everything:

```bash
# Stop all processes
sudo -u actionprotection pm2 stop all
sudo -u actionprotection pm2 delete all

# Restart services
systemctl restart postgresql
systemctl restart nginx

# Redeploy application
./complete-deployment-fixed.sh
```

## Monitoring Commands

### Real-time Monitoring
```bash
# Watch PM2 processes
sudo -u actionprotection pm2 monit

# Watch nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Watch application logs
sudo -u actionprotection pm2 logs action-protection --lines 0
```

### Health Checks
```bash
# Application health
curl -s http://localhost:4000/api/contact | jq .

# nginx health
curl -I http://localhost:80

# Database health
sudo -u postgres psql -d actionprotection_db -c "SELECT COUNT(*) FROM users;"
```

## Log Locations

- **Application logs:** `/home/actionprotection/action-protection/logs/`
- **nginx logs:** `/var/log/nginx/`
- **PostgreSQL logs:** `/var/log/postgresql/`
- **System logs:** `journalctl -u nginx` or `journalctl -u postgresql`

## Configuration Files

- **nginx:** `/etc/nginx/sites-available/action-protection`
- **PM2:** `/home/actionprotection/action-protection/ecosystem.config.cjs`
- **Environment:** Check PM2 config for DATABASE_URL and other vars

## Emergency Recovery

If the server is completely broken:

1. **Backup data:**
   ```bash
   sudo -u postgres pg_dump actionprotection_db > backup.sql
   ```

2. **Kill all processes:**
   ```bash
   sudo lsof -ti:4000 | xargs sudo kill -9
   sudo -u actionprotection pm2 kill
   ```

3. **Full redeploy:**
   ```bash
   ./complete-deployment-fixed.sh
   ```

4. **Restore data if needed:**
   ```bash
   sudo -u postgres psql actionprotection_db < backup.sql
   ```

## Getting Help

1. Run `./diagnose-webserver.sh` first
2. Check the specific error logs
3. Try the solutions for your specific issue
4. If still stuck, run the complete restart process