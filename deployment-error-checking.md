# Deployment Error Checking Guide

## 1. PM2 Application Logs

Check your application logs using PM2:

```bash
# View live logs
sudo -u appuser pm2 logs actionprotection

# View last 50 lines of logs
sudo -u appuser pm2 logs actionprotection --lines 50

# View error logs only
sudo -u appuser pm2 logs actionprotection --err

# View output logs only
sudo -u appuser pm2 logs actionprotection --out
```

## 2. Check PM2 Status

```bash
# Check if application is running
sudo -u appuser pm2 status

# Get detailed info about the application
sudo -u appuser pm2 show actionprotection

# Check PM2 process list
sudo -u appuser pm2 list
```

## 3. Direct Log Files

If PM2 is configured, check the log files directly:

```bash
# Navigate to project directory
cd /home/appuser/actionprotection

# Check error logs
tail -f logs/err.log

# Check output logs
tail -f logs/out.log

# Check combined logs
tail -f logs/combined.log
```

## 4. System Service Logs

Check system-level logs:

```bash
# Check systemd logs for PM2
journalctl -u pm2-appuser -f

# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## 5. Database Connection Issues

Check if database is accessible:

```bash
# Test database connection
sudo -u postgres psql -d actionprotection_db -c "SELECT version();"

# Check database logs
tail -f /var/log/postgresql/postgresql-*.log
```

## 6. Port and Network Issues

Check if application is listening on correct port:

```bash
# Check what's running on port 3000
sudo lsof -i :3000

# Check if port is accessible
curl -I http://localhost:3000

# Test API endpoints
curl http://localhost:3000/api/contact
```

## 7. Application Build Issues

Check if build was successful:

```bash
cd /home/appuser/actionprotection

# Check if dist folder exists
ls -la dist/

# Check if built files exist
ls -la dist/index.js
ls -la dist/public/

# Try rebuilding
sudo -u appuser npm run build
```

## 8. Common Error Patterns

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Check PostgreSQL service and credentials

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill processes on port 3000

### Missing Dependencies
```
Error: Cannot find module 'xyz'
```
**Solution**: Run `npm install` again

### Permission Issues
```
Error: EACCES: permission denied
```
**Solution**: Fix file permissions

## 9. Quick Diagnostic Script

Create a diagnostic script:

```bash
#!/bin/bash
echo "=== PM2 Status ==="
sudo -u appuser pm2 status

echo "=== Application Logs (last 20 lines) ==="
sudo -u appuser pm2 logs actionprotection --lines 20

echo "=== Port Check ==="
sudo lsof -i :3000

echo "=== Database Check ==="
sudo -u postgres psql -d actionprotection_db -c "SELECT 1;"

echo "=== Nginx Status ==="
systemctl status nginx
```

## 10. Restart Services

If needed, restart services:

```bash
# Restart PM2 application
sudo -u appuser pm2 restart actionprotection

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```