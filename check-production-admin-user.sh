#!/bin/bash

# ========================================================================
# Check Production Admin User Database
# ========================================================================
# This script checks the actual admin user data in production database
# ========================================================================

set -e

DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"

echo "🔍 Checking Production Admin User in Database..."

export PGPASSWORD="${DB_PASSWORD}"

# Check if admin user exists
echo "1. Checking for admin users in database..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
SELECT 
    id, 
    email,
    username,
    role,
    is_active,
    CASE WHEN password IS NULL THEN 'NULL' 
         WHEN password = '' THEN 'EMPTY' 
         ELSE 'PRESENT' END as password_status,
    LENGTH(password) as password_length,
    created_at,
    updated_at
FROM users 
WHERE role = 'administrator' 
   OR email LIKE '%admin%' 
   OR username LIKE '%admin%'
ORDER BY created_at DESC;
SQL_EOF

# Generate test password hash
echo ""
echo "2. Generating test password hash for 'admin123456'..."
TEST_HASH=$(node -e "
const bcrypt = require('bcryptjs');
const testPassword = 'admin123456';
const hash = bcrypt.hashSync(testPassword, 10);
console.log('Password: ' + testPassword);
console.log('Hash: ' + hash);
console.log('Length: ' + hash.length);

// Test verification
console.log('Self-verification: ' + bcrypt.compareSync(testPassword, hash));
")

echo "$TEST_HASH"

# Check if we can create/update admin user
echo ""
echo "3. Creating/updating admin user with correct hash..."
NEW_HASH=$(node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123456', 10));
")

psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Delete existing admin users to avoid conflicts
DELETE FROM users WHERE role = 'administrator';

-- Create new admin user
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
    'admin_user_production',
    'admin@actionprotection.com',
    'admin',
    '${NEW_HASH}',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
);

-- Verify the admin user was created
SELECT 
    id, 
    email,
    username,
    role,
    is_active,
    CASE WHEN password IS NULL THEN 'NULL' 
         WHEN password = '' THEN 'EMPTY' 
         ELSE 'PRESENT' END as password_status,
    LENGTH(password) as password_length,
    created_at
FROM users 
WHERE role = 'administrator'
ORDER BY created_at DESC;
SQL_EOF

echo ""
echo "4. Testing admin login via API..."
sleep 2

# Test the login
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    > /tmp/login_test.json

echo "Login test response:"
cat /tmp/login_test.json
echo ""

echo ""
echo "🎉 Admin user database check complete!"
echo "🔐 Admin credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"