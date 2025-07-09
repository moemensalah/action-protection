#!/bin/bash

# ========================================================================
# Fix Production Admin Database Setup
# ========================================================================
# This script creates/fixes the admin user in the production database
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_PASSWORD="admin123456"
ADMIN_USERNAME="admin"

echo "🔧 Fixing Production Admin Database Setup..."

# Navigate to project directory
cd $PROJECT_DIR

# Check current admin user in database
echo "1. Checking current admin user in database..."
sudo -u $APP_USER npm run drizzle-kit:introspect || echo "Introspection failed, continuing..."

# Create admin user fix script
echo "2. Creating admin user database fix..."
sudo -u $APP_USER cat > fix-admin-user.js << 'EOF'
const bcrypt = require('bcryptjs');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function fixAdminUser() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  console.log('🔍 Checking current admin user...');
  
  // Check if admin user exists
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.com'))
    .limit(1);
  
  if (existingAdmin.length > 0) {
    console.log('✅ Admin user found:', existingAdmin[0].email, 'Role:', existingAdmin[0].role);
    
    // Update existing admin user
    console.log('🔄 Updating existing admin user...');
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const [updatedAdmin] = await db
      .update(users)
      .set({
        email: 'admin@actionprotection.com',
        username: 'admin',
        password: hashedPassword,
        role: 'administrator',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, 'admin@actionprotection.com'))
      .returning();
    
    console.log('✅ Admin user updated successfully:', updatedAdmin);
  } else {
    // Create new admin user
    console.log('🆕 Creating new admin user...');
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const [newAdmin] = await db
      .insert(users)
      .values({
        id: 'admin_user_2025',
        email: 'admin@actionprotection.com',
        username: 'admin',
        password: hashedPassword,
        role: 'administrator',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log('✅ Admin user created successfully:', newAdmin);
  }
  
  // Verify admin user
  console.log('🔍 Verifying admin user...');
  const verifyAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.com'))
    .limit(1);
  
  if (verifyAdmin.length > 0) {
    const admin = verifyAdmin[0];
    console.log('✅ Admin verification successful:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Password:', admin.password ? 'SET' : 'NOT SET');
    
    // Test password
    const passwordMatch = await bcrypt.compare('admin123456', admin.password);
    console.log('   Password Test:', passwordMatch ? 'VALID' : 'INVALID');
  } else {
    console.log('❌ Admin user verification failed!');
  }
  
  process.exit(0);
}

fixAdminUser().catch(console.error);
EOF

# Run the admin user fix
echo "3. Running admin user database fix..."
sudo -u $APP_USER NODE_ENV=production node fix-admin-user.js

# Test the login after fix
echo "4. Testing admin login after database fix..."
sleep 5

# Make sure PM2 is running
sudo -u $APP_USER pm2 restart all || sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Wait for restart
sleep 10

# Test login
echo "5. Testing admin login endpoint..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    > /tmp/admin_login_test.json

echo "6. Login test result:"
cat /tmp/admin_login_test.json

# Check if login was successful
if grep -q "Admin login successful" /tmp/admin_login_test.json; then
    echo ""
    echo "✅ SUCCESS: Admin login is working!"
else
    echo ""
    echo "❌ FAILED: Admin login still not working"
    
    # Additional debugging
    echo "7. Additional debugging..."
    
    # Check if admin user exists in database
    echo "Checking admin user in database..."
    sudo -u $APP_USER NODE_ENV=production node -e "
      const { drizzle } = require('drizzle-orm/neon-http');
      const { neon } = require('@neondatabase/serverless');
      const { users } = require('./shared/schema');
      const { eq } = require('drizzle-orm');
      
      async function checkAdmin() {
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql);
        const admin = await db.select().from(users).where(eq(users.email, 'admin@actionprotection.com')).limit(1);
        console.log('Database admin user:', admin[0] || 'NOT FOUND');
      }
      
      checkAdmin().catch(console.error);
    "
    
    # Check server logs
    echo "Checking PM2 logs..."
    sudo -u $APP_USER pm2 logs --lines 20
fi

# Clean up
rm -f fix-admin-user.js

echo ""
echo "🎉 Production admin database fix complete!"
echo ""
echo "Admin credentials:"
echo "  Email: admin@actionprotection.com"
echo "  Password: admin123456"
echo "  URL: https://demox.actionprotectionkw.com/admin"