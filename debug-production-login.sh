#!/bin/bash

# ========================================================================
# Debug Production Login Issue
# ========================================================================
# This script debugs the production login issue step by step
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"

echo "🔍 Debugging Production Login Issue..."

# Check if server code fix was applied
echo "1. Checking server code fix..."
cd $PROJECT_DIR

if grep -q "storage.getUserByEmail(email)" server/routes.ts; then
    echo "✅ Server code fix is present"
    echo "Found line: $(grep -n "storage.getUserByEmail(email)" server/routes.ts)"
else
    echo "❌ Server code fix not found"
    echo "Current line: $(grep -n "getUserBy.*email" server/routes.ts || echo "No matching line found")"
    exit 1
fi

# Check PM2 processes
echo ""
echo "2. Checking PM2 processes..."
pm2 list

# Test database connection and verify admin user
echo ""
echo "3. Verifying admin user in database..."
export PGPASSWORD="${DB_PASSWORD}"

psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Check admin user
SELECT 
    id, 
    email,
    username,
    role,
    is_active,
    LEFT(password, 10) || '...' as password_preview,
    LENGTH(password) as password_length
FROM users 
WHERE role = 'administrator';

-- Test password hash verification
SELECT 
    id,
    email,
    'Testing password verification...' as test_info
FROM users 
WHERE role = 'administrator';
SQL_EOF

# Test Node.js bcrypt verification
echo ""
echo "4. Testing password verification with Node.js..."
node -e "
const bcrypt = require('bcryptjs');
const testPassword = 'admin123456';

// Get the stored hash from database
const { Client } = require('pg');
const client = new Client({
    user: '${DB_USER}',
    host: 'localhost',
    database: '${DB_NAME}',
    password: '${DB_PASSWORD}',
    port: ${DATABASE_PORT}
});

client.connect()
    .then(() => {
        return client.query('SELECT password FROM users WHERE role = \\'administrator\\' LIMIT 1');
    })
    .then(result => {
        if (result.rows.length > 0) {
            const storedHash = result.rows[0].password;
            console.log('Stored hash length:', storedHash.length);
            console.log('Stored hash preview:', storedHash.substring(0, 20) + '...');
            
            const isValid = bcrypt.compareSync(testPassword, storedHash);
            console.log('Password verification result:', isValid);
            
            if (!isValid) {
                console.log('❌ Password verification failed');
                console.log('This indicates the stored hash is incorrect');
            } else {
                console.log('✅ Password verification successful');
            }
        } else {
            console.log('❌ No admin user found');
        }
        return client.end();
    })
    .catch(err => {
        console.error('Database error:', err.message);
        client.end();
    });
"

# Check application logs
echo ""
echo "5. Checking application logs..."
pm2 logs action-protection --lines 5 2>/dev/null || echo "No action-protection logs found"

# Test API endpoints
echo ""
echo "6. Testing API endpoints..."
echo "Testing /api/auth/admin/login endpoint..."

# Enable verbose curl for debugging
curl -v -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    2>&1 | head -20

echo ""
echo "🔍 Debug complete. Check the output above for issues."