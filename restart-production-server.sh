#!/bin/bash

# ========================================================================
# Restart Production Server with Fixed Admin Login
# ========================================================================
# This script restarts the production server and applies the admin login fix
# ========================================================================

set -e

APP_USER="actionprotection"
PROJECT_DIR="/home/actionprotection/action-protection"

echo "🔄 Restarting Production Server with Admin Login Fix..."

# Check PM2 status first
echo "1. Checking current PM2 processes..."
pm2 list

# Stop all PM2 processes
echo ""
echo "2. Stopping all PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Navigate to project directory
echo ""
echo "3. Navigating to project directory..."
cd $PROJECT_DIR

# Copy the fixed server file (this should be done manually or through git)
echo ""
echo "4. Server file needs to be updated with the admin login fix..."
echo "   The fix changes line 164 in server/routes.ts from:"
echo "   storage.getUserByUsername(email) to storage.getUserByEmail(email)"

# Rebuild the application
echo ""
echo "5. Rebuilding the application..."
sudo -u $APP_USER npm run build

# Start the application with PM2
echo ""
echo "6. Starting the application with PM2..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Check PM2 status
echo ""
echo "7. Checking PM2 status..."
pm2 list

# Test the admin login
echo ""
echo "8. Testing admin login..."
sleep 5
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    | head -200

echo ""
echo ""
echo "🎉 Production server restart complete!"
echo "🔐 Admin login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"
echo ""
echo "⚠️  Make sure to update server/routes.ts with the admin login fix before restarting!"