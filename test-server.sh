#!/bin/bash

# Test server functionality and identify specific errors
PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "Testing server functionality..."

cd $PROJECT_DIR

echo "=== PM2 Status ==="
sudo -u $APP_USER pm2 status

echo ""
echo "=== Recent Error Logs ==="
sudo -u $APP_USER pm2 logs --err --lines 20

echo ""
echo "=== Testing API Endpoints ==="
echo "Contact API:"
curl -v http://localhost:3000/api/contact 2>&1 | head -20

echo ""
echo "Categories API:"
curl -v http://localhost:3000/api/categories 2>&1 | head -20

echo ""
echo "Main Route:"
curl -v http://localhost:3000/ 2>&1 | head -20

echo ""
echo "Admin Route:"
curl -v http://localhost:3000/admin 2>&1 | head -20

echo ""
echo "=== Environment Variables ==="
sudo -u $APP_USER pm2 env 0

echo ""
echo "=== Database Test ==="
sudo -u postgres psql -d latelounge_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"