#!/bin/bash

# ========================================================================
# Simple Admin User Fix for Production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Simple admin user fix for production..."

cd $PROJECT_DIR

# Create admin user directly using PostgreSQL
echo "Creating admin user in production database..."
sudo -u $APP_USER node -e "
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Delete existing admin user if exists
    await pool.query('DELETE FROM users WHERE email = \$1', ['admin@actionprotection.com']);
    
    // Create password hash
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    // Insert new admin user
    const result = await pool.query(\`
      INSERT INTO users (
        id, email, username, password, first_name, last_name, 
        role, is_active, created_at, updated_at
      ) VALUES (
        'admin_user_' || extract(epoch from now()),
        'admin@actionprotection.com',
        'admin',
        \$1,
        'Admin',
        'User',
        'administrator',
        true,
        now(),
        now()
      ) RETURNING id, email, role, is_active
    \`, [hashedPassword]);
    
    console.log('✅ Admin user created:', result.rows[0]);
    
    // Test password
    const testResult = await pool.query('SELECT password FROM users WHERE email = \$1', ['admin@actionprotection.com']);
    const isValid = await bcrypt.compare('admin123456', testResult.rows[0].password);
    console.log('✅ Password test:', isValid ? 'VALID' : 'INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
"

echo ""
echo "✅ Admin user fix completed!"
echo ""
echo "📋 Login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"
echo ""
echo "🧪 Test login:"
echo "   curl -X POST http://localhost:4000/api/auth/admin/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@actionprotection.com\",\"password\":\"admin123456\"}'"