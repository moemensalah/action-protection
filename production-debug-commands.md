# Production Server Debug Commands

Run these commands on your Ubuntu production server to identify the forbidden and internal server errors:

## 1. Check PM2 Status and Logs
```bash
# Navigate to your project
cd /home/appuser/latelounge

# Check PM2 status
sudo -u appuser pm2 status

# View recent error logs
sudo -u appuser pm2 logs --err --lines 30

# View all recent logs
sudo -u appuser pm2 logs --lines 50
```

## 2. Test Server Connectivity
```bash
# Test if server is running on port 3000
netstat -tlnp | grep :3000

# Test API endpoints directly
curl -v http://localhost:3000/api/contact
curl -v http://localhost:3000/api/categories
curl -v http://localhost:3000/

# Check server response headers
curl -I http://localhost:3000/
```

## 3. Check Environment Variables
```bash
# View PM2 environment variables
sudo -u appuser pm2 env 0

# Check .env file
cat /home/appuser/latelounge/.env
```

## 4. Database Connection Test
```bash
# Test database connection
sudo -u postgres psql -d latelounge_db -c "SELECT 1;"

# Check if tables exist
sudo -u postgres psql -d latelounge_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

## 5. Authentication Module Check
```bash
# Check if authentication fixes were applied
grep -n "REPLIT_DOMAINS\|throw new Error" /home/appuser/latelounge/server/replitAuth.ts

# Check built application
ls -la /home/appuser/latelounge/dist/
```

## 6. Manual Server Test
```bash
# Stop PM2 and test server manually
sudo -u appuser pm2 stop all

# Try starting server manually to see direct errors
cd /home/appuser/latelounge
sudo -u appuser DATABASE_URL="postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db" npm run dev
```

## Quick Fixes to Try

### Fix 1: Restart with Environment Variables
```bash
cd /home/appuser/latelounge
sudo -u appuser pm2 delete all
sudo -u appuser pm2 start ecosystem.config.cjs --env production
```

### Fix 2: Apply Simplified Authentication
```bash
chmod +x quick-server-fix.sh
sudo ./quick-server-fix.sh
```

### Fix 3: Check Nginx Configuration
```bash
# Check if Nginx is interfering
sudo systemctl status nginx
sudo nginx -t

# Check Nginx logs
sudo tail -50 /var/log/nginx/error.log
```

## Common Issues and Solutions

**Forbidden Errors:**
- Usually caused by authentication middleware blocking requests
- Check if `isAuthenticated` middleware is being applied to public routes

**Internal Server Errors:**
- Often caused by database connection issues
- Check environment variables and database connectivity
- Look for missing tables or schema mismatches

**Port Issues:**
- Verify no other service is using port 3000
- Check if PM2 is actually binding to the correct port

Run these commands and share the output to identify the exact cause of your forbidden and internal server errors.