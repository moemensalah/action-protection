#!/bin/bash

# ========================================================================
# Find Where Website Users Are Actually Stored
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Finding where website users are actually stored..."

cd $PROJECT_DIR

# Test: Create a new website user through the API
echo "1. Creating test website user through API..."
TEST_EMAIL="debug_user_$(date +%s)@test.com"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/local/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"username\":\"debuguser\",\"password\":\"testpass123\",\"firstName\":\"Debug\",\"lastName\":\"User\"}" \
    -w "\nHTTP_CODE:%{http_code}")

echo "API Response: $RESPONSE"
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ User created successfully via API"
    
    # Check all possible database locations
    echo ""
    echo "2. Checking actionprotection_db for the new user..."
    sudo -u postgres psql -d actionprotection_db -c "SELECT email, username, created_at FROM website_users WHERE email = '$TEST_EMAIL';" || echo "Not found in actionprotection_db/website_users"
    
    echo ""
    echo "3. Checking actionprotection_db users table..."
    sudo -u postgres psql -d actionprotection_db -c "SELECT email, username, created_at FROM users WHERE email = '$TEST_EMAIL';" || echo "Not found in actionprotection_db/users"
    
    echo ""
    echo "4. Checking all databases for this user..."
    for db in actionprotection_db latelounge latelounge_db; do
        echo "Checking database: $db"
        sudo -u postgres psql -d "$db" -c "SELECT email, username FROM website_users WHERE email = '$TEST_EMAIL';" 2>/dev/null || echo "  Not found in $db/website_users"
        sudo -u postgres psql -d "$db" -c "SELECT email, username FROM users WHERE email = '$TEST_EMAIL';" 2>/dev/null || echo "  Not found in $db/users"
    done
    
    echo ""
    echo "5. Testing login with the new user..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/local/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\"}" \
        -w "\nHTTP_CODE:%{http_code}")
    
    echo "Login Response: $LOGIN_RESPONSE"
    
    echo ""
    echo "6. Checking application's actual database connection..."
    sudo -u $APP_USER node -e "
    const { Pool } = require('pg');
    
    async function checkRealConnection() {
        try {
            console.log('DATABASE_URL:', process.env.DATABASE_URL);
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            
            const dbInfo = await pool.query('SELECT current_database(), current_user, version()');
            console.log('Connected to database:', dbInfo.rows[0].current_database);
            console.log('As user:', dbInfo.rows[0].current_user);
            
            console.log('\\nTables in this database:');
            const tables = await pool.query(\"SELECT tablename FROM pg_tables WHERE schemaname = 'public'\");
            tables.rows.forEach(row => console.log('  -', row.tablename));
            
            console.log('\\nLooking for our test user in website_users:');
            const testUser = await pool.query('SELECT email, username, created_at FROM website_users WHERE email = \$1', ['$TEST_EMAIL']);
            if (testUser.rows.length > 0) {
                console.log('✅ Found test user:', testUser.rows[0]);
            } else {
                console.log('❌ Test user not found in website_users');
            }
            
            console.log('\\nAll website_users in application database:');
            const allUsers = await pool.query('SELECT email, username, created_at FROM website_users ORDER BY created_at DESC LIMIT 10');
            allUsers.rows.forEach(user => console.log('  -', user.email, user.username, user.created_at));
            
            await pool.end();
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
    
    checkRealConnection();
    "
    
else
    echo "❌ Failed to create user via API (HTTP $HTTP_CODE)"
fi

echo ""
echo "7. Checking PM2 process database environment..."
sudo -u $APP_USER pm2 show action-protection | grep -A 5 "env:" || echo "No PM2 env found"

echo ""
echo "✅ Website users investigation completed!"