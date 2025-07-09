#!/bin/bash

# ========================================================================
# Fix PM2 Permissions and Restart Production Server
# ========================================================================
# This script fixes PM2 permission issues and restarts the server properly
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing PM2 Permissions and Restarting Server..."

# Check current PM2 processes and their owners
echo "1. Checking current PM2 processes..."
echo "Root PM2 processes:"
pm2 list 2>/dev/null || echo "No PM2 processes under root"

echo ""
echo "User PM2 processes:"
sudo -u $APP_USER pm2 list 2>/dev/null || echo "No PM2 processes under $APP_USER"

# Stop all PM2 processes (both root and user)
echo ""
echo "2. Stopping all PM2 processes..."
echo "Stopping root PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

echo "Stopping user PM2 processes..."
sudo -u $APP_USER pm2 stop all 2>/dev/null || true
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Kill any remaining processes on port 4000
echo ""
echo "3. Killing any processes on port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Navigate to project directory and set permissions
echo ""
echo "4. Setting up project permissions..."
cd $PROJECT_DIR
chown -R $APP_USER:$APP_USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Rebuild the application
echo ""
echo "5. Rebuilding application..."
sudo -u $APP_USER npm run build

# Start PM2 processes under the correct user
echo ""
echo "6. Starting PM2 processes under $APP_USER..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Check the new PM2 status
echo ""
echo "7. New PM2 status:"
sudo -u $APP_USER pm2 list

# Save PM2 configuration and set up startup
echo ""
echo "8. Saving PM2 configuration..."
sudo -u $APP_USER pm2 save

# Test the application
echo ""
echo "9. Testing application (waiting 10 seconds)..."
sleep 10

echo "Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    || echo "Login test failed"

echo ""
echo "🎉 PM2 permissions fixed and server restarted!"
echo ""
echo "To manage PM2 processes in the future, use:"
echo "  sudo -u $APP_USER pm2 list"
echo "  sudo -u $APP_USER pm2 restart all"
echo "  sudo -u $APP_USER pm2 stop all"
echo "  sudo -u $APP_USER pm2 logs"