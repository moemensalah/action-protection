#!/bin/bash

# ========================================================================
# Fix Admin User with Environment Variable Check
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing admin user with environment check..."

cd $PROJECT_DIR

# Check if DATABASE_URL is properly set
echo "1. Checking DATABASE_URL environment variable..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in environment"
    echo "Checking PM2 environment..."
    sudo -u $APP_USER pm2 show action-protection | grep -A 10 "env:"
    exit 1
fi

echo "✅ DATABASE_URL found: ${DATABASE_URL:0:30}..."

# Create admin user using proper connection
echo "2. Creating admin user in production database..."
sudo -u $APP_USER NODE_ENV=production node -e "
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('Connecting to database...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Delete existing admin user if exists
    await sql\`DELETE FROM users WHERE email = 'admin@actionprotection.com'\`;
    console.log('✅ Existing admin user removed');
    
    // Create password hash
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    console.log('✅ Password hash created');
    
    // Insert new admin user
    const result = await sql\`
      INSERT INTO users (
        id, email, username, password, first_name, last_name, 
        role, is_active, created_at, updated_at
      ) VALUES (
        \${'admin_user_' + Date.now()},
        'admin@actionprotection.com',
        'admin',
        \${hashedPassword},
        'Admin',
        'User',
        'administrator',
        true,
        NOW(),
        NOW()
      ) RETURNING id, email, role, is_active
    \`;
    
    console.log('✅ Admin user created:', result[0]);
    
    // Test password
    const testResult = await sql\`SELECT password FROM users WHERE email = 'admin@actionprotection.com'\`;
    const isValid = await bcrypt.compare('admin123456', testResult[0].password);
    console.log('✅ Password test:', isValid ? 'VALID' : 'INVALID');
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

createAdminUser();
"

echo ""
echo "3. Testing admin login..."
curl -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}'

echo ""
echo ""
echo "✅ Admin user fix completed!"
echo ""
echo "📋 Login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"