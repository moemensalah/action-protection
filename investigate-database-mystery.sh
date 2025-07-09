#!/bin/bash

# ========================================================================
# Investigate Database Connection Mystery
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Investigating database connection mystery..."

cd $PROJECT_DIR

echo "1. Checking PM2 environment variables..."
sudo -u $APP_USER pm2 show action-protection | grep -A 30 "env:" || echo "No PM2 process found"

echo ""
echo "2. Checking current DATABASE_URL format..."
sudo -u $APP_USER pm2 logs action-protection --lines 20 | grep -i "database\|connect" || echo "No database logs found"

echo ""
echo "3. Testing application's actual database connection..."
curl -X POST http://localhost:4000/api/auth/local/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","username":"testuser","password":"testpass123","firstName":"Test","lastName":"User"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "4. Checking if user exists in local PostgreSQL..."
sudo -u postgres psql -d actionprotection_db -c "SELECT email, username FROM website_users WHERE email = 'test@test.com';" || echo "Local PostgreSQL check failed"

echo ""
echo "5. Checking all available PostgreSQL databases..."
sudo -u postgres psql -c "\l" | grep -i action || echo "No action databases found in local PostgreSQL"

echo ""
echo "6. Checking if app is using external/cloud database..."
sudo -u $APP_USER node -e "
console.log('Environment DATABASE_URL:', process.env.DATABASE_URL);
console.log('');

const { Pool } = require('pg');
async function checkActualConnection() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()');
    console.log('✅ Application database connection:');
    console.log('  Database:', result.rows[0].current_database);
    console.log('  User:', result.rows[0].current_user);
    console.log('  Host:', result.rows[0].inet_server_addr);
    console.log('  Port:', result.rows[0].inet_server_port);
    
    console.log('');
    console.log('📋 All website users in application database:');
    const users = await pool.query('SELECT email, username, created_at FROM website_users ORDER BY created_at DESC');
    users.rows.forEach(user => {
      console.log(\`  - \${user.email} (\${user.username}) - \${user.created_at}\`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

checkActualConnection();
"

echo ""
echo "7. Checking system environment vs PM2 environment..."
echo "System DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "PM2 DATABASE_URL:"
sudo -u $APP_USER pm2 env 0 | grep DATABASE_URL || echo "No DATABASE_URL in PM2"

echo ""
echo "8. Checking for multiple database connections..."
sudo -u $APP_USER grep -r "DATABASE_URL\|connectionString" . --include="*.js" --include="*.ts" --include="*.json" | head -10

echo ""
echo "✅ Database mystery investigation completed!"