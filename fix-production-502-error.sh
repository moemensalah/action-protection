#!/bin/bash

# ========================================================================
# Fix Production 502 Bad Gateway Error
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing production 502 Bad Gateway error..."

cd $PROJECT_DIR

# Check current PM2 status
echo "1. Checking PM2 status..."
sudo -u $APP_USER pm2 list

# Check application logs
echo "2. Checking application logs..."
sudo -u $APP_USER pm2 logs action-protection --lines 20

# Check if port 4000 is being used
echo "3. Checking port 4000..."
netstat -tulpn | grep :4000 || echo "Port 4000 not in use"

# Stop all PM2 processes
echo "4. Stopping all PM2 processes..."
sudo -u $APP_USER pm2 stop all || true
sudo -u $APP_USER pm2 delete all || true

# Kill any remaining node processes
echo "5. Cleaning up any remaining processes..."
pkill -f "node.*index.ts" || true
pkill -f "node.*server" || true

# Set correct environment variables and restart
echo "6. Setting environment variables and restarting..."
export DATABASE_URL="postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db"
export NODE_ENV="production"
export PORT="4000"

# Start application with correct environment
echo "7. Starting application with PM2..."
sudo -u $APP_USER bash -c "
  export DATABASE_URL='postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db'
  export NODE_ENV='production'
  export PORT='4000'
  cd $PROJECT_DIR
  pm2 start ecosystem.config.cjs --env production --name action-protection
"

# Wait for startup
echo "8. Waiting for application startup..."
sleep 15

# Check if application is running
echo "9. Checking if application is running..."
sudo -u $APP_USER pm2 list

# Test port 4000
echo "10. Testing port 4000..."
curl -s http://localhost:4000/api/categories -w "\nHTTP Status: %{http_code}\n" | head -5

# Check nginx status
echo "11. Checking nginx status..."
systemctl status nginx --no-pager -l

# Test nginx proxy
echo "12. Testing nginx proxy..."
curl -s -I http://localhost:80 | head -5

# Test SSL/domain
echo "13. Testing domain..."
curl -s -I https://demox.actionprotectionkw.com | head -5

# Show final status
echo "14. Final status check..."
sudo -u $APP_USER pm2 list
echo ""
echo "Nginx processes:"
ps aux | grep nginx | grep -v grep

# Test admin login
echo "15. Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Production 502 error fix completed!"
echo ""
echo "🔍 If still seeing 502 errors, check:"
echo "   - Application logs: sudo -u actionprotection pm2 logs action-protection"
echo "   - Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "   - Port status: netstat -tulpn | grep :4000"
echo ""
echo "🌐 Test URLs:"
echo "   - Direct app: http://localhost:4000"
echo "   - Through nginx: http://localhost:80"
echo "   - Domain: https://demox.actionprotectionkw.com"