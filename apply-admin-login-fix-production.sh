#!/bin/bash

# ========================================================================
# Apply Admin Login Fix to Production Server
# ========================================================================
# This script applies the admin login fix directly to production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"

echo "🔧 Applying Admin Login Fix to Production Server..."

# Navigate to project directory
cd $PROJECT_DIR

# Check current PM2 processes
echo "1. Current PM2 processes:"
pm2 list

# Stop all processes
echo ""
echo "2. Stopping all PM2 processes..."
pm2 stop all 2>/dev/null || true

# Apply the fix to server/routes.ts
echo ""
echo "3. Applying admin login fix to server/routes.ts..."
if [ -f "server/routes.ts" ]; then
    # Backup original file
    cp server/routes.ts server/routes.ts.backup
    
    # Apply the fix
    sed -i 's/storage\.getUserByUsername(email)/storage.getUserByEmail(email)/g' server/routes.ts
    
    # Verify the fix was applied
    if grep -q "storage.getUserByEmail(email)" server/routes.ts; then
        echo "✅ Admin login fix applied successfully"
    else
        echo "❌ Fix not applied, restoring backup"
        cp server/routes.ts.backup server/routes.ts
        exit 1
    fi
else
    echo "❌ server/routes.ts not found"
    exit 1
fi

# Rebuild the application
echo ""
echo "4. Rebuilding application..."
sudo -u actionprotection npm run build

# Start PM2 with the correct configuration
echo ""
echo "5. Starting PM2 processes..."
sudo -u actionprotection pm2 start ecosystem.config.cjs --env production

# Check status
echo ""
echo "6. PM2 status:"
pm2 list

# Test the admin login
echo ""
echo "7. Testing admin login (waiting 5 seconds for startup)..."
sleep 5

# Test admin login
TEST_RESULT=$(curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "%{http_code}")

HTTP_CODE="${TEST_RESULT: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Admin login test successful!"
    echo "Response: ${TEST_RESULT%???}"
else
    echo "❌ Admin login test failed (HTTP $HTTP_CODE)"
    echo "Response: ${TEST_RESULT%???}"
fi

echo ""
echo "🎉 Production server updated and restarted!"
echo "🔐 Admin login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"