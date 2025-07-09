#!/bin/bash

# ========================================================================
# Check Admin User in Production Database
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Checking admin user in production database..."

cd $PROJECT_DIR

# Check admin user in database
sudo -u $APP_USER NODE_ENV=production node -e "
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('./shared/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function checkAdminUser() {
  console.log('Connecting to production database...');
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  // Check for admin user with .com email
  console.log('\\n1. Checking for admin@actionprotection.com...');
  const adminCom = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.com'))
    .limit(1);
  
  if (adminCom.length > 0) {
    const admin = adminCom[0];
    console.log('✅ Found admin@actionprotection.com:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Has Password:', admin.password ? 'YES' : 'NO');
    
    // Test password
    if (admin.password) {
      const passwordTest = await bcrypt.compare('admin123456', admin.password);
      console.log('   Password Test:', passwordTest ? 'VALID' : 'INVALID');
    }
  } else {
    console.log('❌ No admin@actionprotection.com found');
  }
  
  // Check for admin user with .kw email
  console.log('\\n2. Checking for admin@actionprotection.kw...');
  const adminKw = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.kw'))
    .limit(1);
  
  if (adminKw.length > 0) {
    const admin = adminKw[0];
    console.log('✅ Found admin@actionprotection.kw:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.isActive);
    console.log('   Has Password:', admin.password ? 'YES' : 'NO');
    
    // Test password
    if (admin.password) {
      const passwordTest = await bcrypt.compare('admin123456', admin.password);
      console.log('   Password Test:', passwordTest ? 'VALID' : 'INVALID');
    }
  } else {
    console.log('❌ No admin@actionprotection.kw found');
  }
  
  // Check all users to see what exists
  console.log('\\n3. All users in database:');
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
      hasPassword: users.password ? 'YES' : 'NO'
    })
    .from(users)
    .limit(10);
  
  if (allUsers.length > 0) {
    console.log('   Total users found:', allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(\`   \${index + 1}. \${user.email} (\${user.role}) - Active: \${user.isActive} - Password: \${user.hasPassword}\`);
    });
  } else {
    console.log('   No users found in database');
  }
}

checkAdminUser().catch(console.error);
"

echo ""
echo "✅ Database check completed!"
echo ""
echo "📋 Manual login credentials to try:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo ""
echo "   Email: admin@actionprotection.kw"
echo "   Password: admin123456"
echo ""
echo "🌐 Production admin URL: https://demox.actionprotectionkw.com/admin"