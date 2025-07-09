#!/bin/bash

# ========================================================================
# Fix Production Storage Configuration
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing production storage configuration..."

cd $PROJECT_DIR

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Check database connection
echo "2. Testing database connection..."
sudo -u $APP_USER node -e "
const { Pool } = require('pg');

async function testConnection() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query('SELECT current_database(), current_user');
    console.log('✅ Database connection successful');
    console.log('  Database:', result.rows[0].current_database);
    console.log('  User:', result.rows[0].current_user);
    
    // Test website_users table
    const tableCheck = await pool.query('SELECT COUNT(*) FROM website_users');
    console.log('  Website users count:', tableCheck.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('This explains why users are not being saved to database');
  }
}

testConnection();
"

# Create admin user directly in database
echo "3. Creating admin user in database..."
sudo -u postgres psql -d actionprotection_db << 'EOF'
-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@actionprotection.com';

-- Insert admin user with bcrypt hash for 'admin123456'
INSERT INTO users (
    id, 
    email, 
    username, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'admin_user_' || extract(epoch from now()),
    'admin@actionprotection.com',
    'admin',
    '$2b$12$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
);

-- Verify admin user was created
SELECT email, username, role FROM users WHERE email = 'admin@actionprotection.com';
EOF

# Fix environment variables for production
echo "4. Updating PM2 environment variables..."
sudo -u $APP_USER pm2 delete action-protection || true

# Start with correct DATABASE_URL
echo "5. Starting PM2 with correct database configuration..."
sudo -u $APP_USER DATABASE_URL="postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db" pm2 start ecosystem.config.cjs --env production --name action-protection

# Wait for startup
echo "6. Waiting for application startup..."
sleep 10

# Test database connection through app
echo "7. Testing database connection through application..."
curl -s -X POST http://localhost:4000/api/auth/local/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test_storage@test.com","username":"teststorage","password":"testpass123","firstName":"Test","lastName":"Storage"}' \
    -w "\nHTTP Status: %{http_code}\n"

# Check if user was saved to database
echo "8. Checking if user was saved to database..."
sudo -u postgres psql -d actionprotection_db -c "SELECT email, username, created_at FROM website_users WHERE email = 'test_storage@test.com';"

# Test admin login
echo "9. Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Production storage fix completed!"
echo ""
echo "📋 Login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"
echo ""
echo "🔍 If users are now being saved to database, the issue is fixed!"
echo "    Run: sudo -u postgres psql -d actionprotection_db -c 'SELECT email, username FROM website_users ORDER BY created_at DESC LIMIT 5;'"