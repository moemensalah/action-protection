#!/bin/bash

# ========================================================================
# Fix Admin Login Username/Email Issue - Production Action Protection
# ========================================================================
# This script fixes the admin login issue where the code looks for username
# but the login form sends email
# ========================================================================

set -e

# Configuration
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"

echo "🔧 Fixing Admin Login Username/Email Issue..."
echo "📧 Admin Email: ${ADMIN_EMAIL}"
echo "👤 Admin Username: ${ADMIN_USERNAME}"
echo ""

export PGPASSWORD="${DB_PASSWORD}"

# Check current admin user state
echo "1. Checking current admin user state..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
SELECT 
    id, 
    email,
    username,
    role,
    is_active,
    CASE WHEN password IS NULL THEN 'NULL' ELSE 'PRESENT' END as password_status
FROM users 
WHERE role = 'administrator' OR email = '${ADMIN_EMAIL}' OR username = '${ADMIN_USERNAME}'
ORDER BY created_at DESC;
SQL_EOF

# Generate correct password hash
echo ""
echo "2. Generating correct password hash..."
PASSWORD_HASH=$(node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('${ADMIN_PASSWORD}', 10));
")

# Fix the admin user to have both email and username properly set
echo ""
echo "3. Fixing admin user with correct email and username..."
psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Update the admin user to have both email and username properly set
UPDATE users 
SET 
    email = '${ADMIN_EMAIL}',
    username = '${ADMIN_USERNAME}',
    password = '${PASSWORD_HASH}',
    role = 'administrator',
    is_active = true,
    updated_at = NOW()
WHERE role = 'administrator' OR id = 'admin_user';

-- Verify the update
SELECT 
    id, 
    email,
    username,
    role,
    is_active,
    CASE WHEN password IS NULL THEN 'NULL' ELSE 'PRESENT' END as password_status,
    updated_at
FROM users 
WHERE role = 'administrator'
ORDER BY updated_at DESC
LIMIT 1;
SQL_EOF

# Test the login scenarios
echo ""
echo "4. Testing login scenarios..."

# Test 1: Login with username (what getUserByUsername expects)
echo "Testing login with username..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"'${ADMIN_USERNAME}'","password":"'${ADMIN_PASSWORD}'"}' \
    | jq -r '.message // .error // "No response"' || echo "Username login test failed"

# Test 2: Login with email (what the form actually sends)
echo "Testing login with email..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"'${ADMIN_EMAIL}'","password":"'${ADMIN_PASSWORD}'"}' \
    | jq -r '.message // .error // "No response"' || echo "Email login test failed"

# Check if jq is available for JSON parsing
if ! command -v jq >/dev/null 2>&1; then
    echo "⚠️  jq not available, installing..."
    apt update && apt install -y jq
fi

echo ""
echo "5. Showing debugging info..."
echo "The issue is that the admin login code calls:"
echo "  storage.getUserByUsername(email) // Wrong: passes email to username search"
echo ""
echo "But it should call:"
echo "  storage.getUserByEmail(email) // Correct: passes email to email search"
echo ""
echo "Current admin user has:"
echo "  Email: ${ADMIN_EMAIL}"
echo "  Username: ${ADMIN_USERNAME}"
echo ""
echo "To fix this permanently, the server code needs to be updated to use:"
echo "  getUserByEmail(email) instead of getUserByUsername(email)"

echo ""
echo "🎉 Admin user data fixed!"
echo "🔐 Login credentials:"
echo "   Email: ${ADMIN_EMAIL}"
echo "   Username: ${ADMIN_USERNAME}"
echo "   Password: ${ADMIN_PASSWORD}"
echo "   URL: https://demox.actionprotectionkw.com/admin"
echo ""
echo "⚠️  The server code still needs to be updated to use getUserByEmail instead of getUserByUsername"