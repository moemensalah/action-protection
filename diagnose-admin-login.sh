#!/bin/bash

# ========================================================================
# Diagnose Admin Login Issues - Production Action Protection
# ========================================================================
# This script diagnoses why admin login is failing in production
# Run this on your Ubuntu server to identify the issue
# ========================================================================

set -e

# Configuration (match your deployment script)
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"

echo "🔍 Diagnosing Admin Login Issues for Action Protection..."
echo "📊 Database: ${DB_NAME}"
echo "👤 DB User: ${DB_USER}"
echo "🔌 Port: ${DATABASE_PORT}"
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running"
    echo "Start it with: sudo systemctl start postgresql"
    exit 1
fi

# Check database connection
echo ""
echo "2. Testing database connection..."
export PGPASSWORD="${DB_PASSWORD}"

if psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Check database configuration and credentials"
    exit 1
fi

# Check if users table exists
echo ""
echo "3. Checking users table structure..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'users'
);

-- Show table structure
\d users;
SQL_EOF

# Check existing admin users
echo ""
echo "4. Checking existing admin users..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Show all users with admin role
SELECT id, email, role, is_active, created_at, 
       CASE WHEN password IS NULL THEN 'NULL' ELSE 'PRESENT' END as password_status
FROM users 
WHERE role = 'administrator' OR role = 'admin' OR email LIKE '%admin%'
ORDER BY created_at DESC;
SQL_EOF

# Check for schema issues
echo ""
echo "5. Checking for schema issues..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Check if password column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('password', 'email', 'role', 'is_active');
SQL_EOF

# Test bcrypt hash generation
echo ""
echo "6. Testing bcrypt hash generation..."
if command -v node >/dev/null 2>&1; then
    echo "Node.js is available"
    node -e "
    try {
        const bcrypt = require('bcryptjs');
        const testPassword = 'admin123456';
        const hash = bcrypt.hashSync(testPassword, 10);
        console.log('✅ Bcrypt hash generated successfully');
        console.log('Password: ' + testPassword);
        console.log('Hash: ' + hash);
        console.log('Verification: ' + bcrypt.compareSync(testPassword, hash));
    } catch (error) {
        console.log('❌ Bcrypt error:', error.message);
    }
    "
else
    echo "❌ Node.js not available"
fi

# Check PM2 status
echo ""
echo "7. Checking application status..."
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 processes:"
    pm2 status
    echo ""
    echo "Recent PM2 logs:"
    pm2 logs --lines 10
else
    echo "❌ PM2 not available"
fi

echo ""
echo "🔍 Diagnosis complete!"
echo ""
echo "📋 Common issues and solutions:"
echo "1. If users table missing: Run database migration"
echo "2. If password column missing: Update database schema"
echo "3. If admin user missing: Create admin user manually"
echo "4. If password hash wrong: Update with correct hash"
echo "5. If app not running: Check PM2 logs and restart"