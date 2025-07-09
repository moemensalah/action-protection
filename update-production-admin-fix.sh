#!/bin/bash

# ========================================================================
# Update Production with Admin Login Fix (No Git)
# ========================================================================
# This script manually applies the admin login fix to production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Applying Admin Login Fix to Production..."

# Navigate to project directory
cd $PROJECT_DIR

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Fix AdminLogin.tsx component directly
echo "2. Fixing AdminLogin.tsx component..."
sudo -u $APP_USER sed -i 's/admin@actionprotection\.kw/admin@actionprotection.com/g' client/src/components/admin/AdminLogin.tsx

# Verify the fix was applied
echo "3. Verifying fix was applied..."
if grep -q "admin@actionprotection.com" client/src/components/admin/AdminLogin.tsx; then
    echo "✅ AdminLogin.tsx fix applied successfully"
else
    echo "❌ AdminLogin.tsx fix failed"
    exit 1
fi

# Set permissions
echo "4. Setting permissions..."
chown -R $APP_USER:$APP_USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Rebuild application
echo "5. Rebuilding application..."
sudo -u $APP_USER npm run build

# Restart PM2
echo "6. Restarting PM2 processes..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Wait for startup
echo "7. Waiting for application startup..."
sleep 15

# Test the fix
echo "8. Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    > /tmp/login_test_result.json

echo "9. Login test result:"
cat /tmp/login_test_result.json

# Check if successful
if grep -q "Admin login successful" /tmp/login_test_result.json; then
    echo ""
    echo "✅ SUCCESS: Admin login is now working!"
    echo ""
    echo "You can now login with:"
    echo "  Email: admin@actionprotection.com"
    echo "  Password: admin123456"
    echo "  URL: https://demox.actionprotectionkw.com/admin"
else
    echo ""
    echo "❌ Login test failed. Running database fix..."
    
    # Run database fix as fallback
    echo "10. Running database fix..."
    sudo -u $APP_USER NODE_ENV=production node -e "
      const bcrypt = require('bcryptjs');
      const { drizzle } = require('drizzle-orm/neon-http');
      const { neon } = require('@neondatabase/serverless');
      const { users } = require('./shared/schema');
      const { eq } = require('drizzle-orm');
      
      async function fixAdmin() {
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql);
        
        console.log('Checking/fixing admin user...');
        const hashedPassword = await bcrypt.hash('admin123456', 12);
        
        try {
          const [admin] = await db
            .update(users)
            .set({
              email: 'admin@actionprotection.com',
              password: hashedPassword,
              role: 'administrator',
              isActive: true
            })
            .where(eq(users.email, 'admin@actionprotection.com'))
            .returning();
          
          console.log('Admin user updated:', admin.email, admin.role);
        } catch (error) {
          console.error('Database fix failed:', error);
        }
      }
      
      fixAdmin().catch(console.error);
    "
    
    # Test again after database fix
    sleep 5
    curl -s -X POST http://localhost:4000/api/auth/admin/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
        > /tmp/login_final_test.json
    
    echo "Final test result:"
    cat /tmp/login_final_test.json
fi

# Show PM2 status
echo ""
echo "PM2 Status:"
sudo -u $APP_USER pm2 list

echo ""
echo "🎉 Production update complete!"