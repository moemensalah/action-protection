#!/bin/bash

# ========================================================================
# Fix Production Server Code - Apply Admin Login Fix
# ========================================================================
# This script applies the server code fix and restarts production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Applying Server Code Fix to Production..."

# Navigate to project directory
cd $PROJECT_DIR

# Check if the fix has already been applied
echo "1. Checking current server code..."
if grep -q "storage.getUserByEmail(email)" server/routes.ts; then
    echo "✅ Server code fix already applied"
else
    echo "⚠️  Server code fix not applied yet"
    
    # Backup and apply the fix
    cp server/routes.ts server/routes.ts.backup
    
    # Apply the fix - change getUserByUsername to getUserByEmail
    sed -i 's/storage\.getUserByUsername(email)/storage.getUserByEmail(email)/g' server/routes.ts
    
    # Verify the fix
    if grep -q "storage.getUserByEmail(email)" server/routes.ts; then
        echo "✅ Server code fix applied successfully"
    else
        echo "❌ Failed to apply server code fix"
        exit 1
    fi
fi

# Show the PM2 status
echo ""
echo "2. Current PM2 status:"
pm2 list

# Stop and restart PM2 processes
echo ""
echo "3. Restarting PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Rebuild the application
echo ""
echo "4. Rebuilding application..."
sudo -u $APP_USER npm run build

# Start PM2 with ecosystem config
echo ""
echo "5. Starting PM2 processes..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Check PM2 status
echo ""
echo "6. New PM2 status:"
pm2 list

# Test the admin login
echo ""
echo "7. Testing admin login (waiting 10 seconds for startup)..."
sleep 10

echo "Testing admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}')

echo "Login response: $LOGIN_RESPONSE"

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q "Admin login successful"; then
    echo "✅ Admin login test SUCCESSFUL!"
    echo ""
    echo "🎉 Production server is now working!"
    echo "🔐 Admin login credentials:"
    echo "   Email: admin@actionprotection.com"
    echo "   Password: admin123456"
    echo "   URL: https://demox.actionprotectionkw.com/admin"
else
    echo "❌ Admin login test failed"
    echo "Response: $LOGIN_RESPONSE"
    
    # Show PM2 logs for debugging
    echo ""
    echo "PM2 logs for debugging:"
    pm2 logs --lines 10
fi

echo ""
echo "🔄 Production server restart complete!"