#!/bin/bash

# Comprehensive server diagnostics for LateLounge deployment
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔍 Running comprehensive server diagnostics..."

cd $PROJECT_DIR

echo "=== PM2 Status ==="
sudo -u $APP_USER pm2 status || echo "PM2 not running"

echo ""
echo "=== PM2 Logs (Last 30 lines) ==="
sudo -u $APP_USER pm2 logs --lines 30 || echo "No PM2 logs available"

echo ""
echo "=== Application Error Logs ==="
if [ -f "logs/err.log" ]; then
    echo "Error log contents:"
    tail -50 logs/err.log
else
    echo "No error log found"
fi

echo ""
echo "=== Application Output Logs ==="
if [ -f "logs/out.log" ]; then
    echo "Output log contents:"
    tail -50 logs/out.log
else
    echo "No output log found"
fi

echo ""
echo "=== Server Port Check ==="
netstat -tlnp | grep :3000 || echo "Port 3000 not in use"

echo ""
echo "=== Test Direct Server Connection ==="
timeout 5 curl -v http://localhost:3000/ 2>&1 || echo "Cannot connect to localhost:3000"

echo ""
echo "=== Environment Variables Check ==="
sudo -u $APP_USER pm2 env 0 2>/dev/null || echo "Cannot get PM2 environment"

echo ""
echo "=== Database Connection Test ==="
sudo -u postgres psql -d latelounge_db -c "SELECT 1;" 2>/dev/null && echo "Database connection OK" || echo "Database connection failed"

echo ""
echo "=== Check Built Application ==="
if [ -f "dist/index.js" ]; then
    echo "Built application exists"
    echo "File size: $(du -h dist/index.js)"
    echo "First 10 lines:"
    head -10 dist/index.js
else
    echo "No built application found"
fi

echo ""
echo "=== Check Authentication Module ==="
if [ -f "server/replitAuth.ts" ]; then
    echo "Authentication module exists"
    grep -n "REPLIT_DOMAINS\|throw new Error" server/replitAuth.ts || echo "No auth errors found"
else
    echo "Authentication module missing"
fi

echo ""
echo "=== Manual Server Test ==="
echo "Testing server startup manually..."
sudo -u $APP_USER timeout 10 tsx server/index.ts &
sleep 5
curl -s http://localhost:5000/api/contact 2>/dev/null && echo "Manual server responds OK" || echo "Manual server connection failed"
pkill -f "tsx server/index.ts" 2>/dev/null || true

echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager || echo "Nginx not running"

echo ""
echo "=== Check Nginx Configuration ==="
if [ -f "/etc/nginx/sites-available/latelounge" ]; then
    echo "Nginx config exists"
    nginx -t 2>&1 || echo "Nginx config has errors"
else
    echo "No nginx config found"
fi

echo ""
echo "=== System Resources ==="
echo "Memory usage:"
free -h
echo "Disk usage:"
df -h
echo "CPU load:"
uptime

echo ""
echo "✅ Diagnostics complete!"