#!/bin/bash

# ========================================================================
# Create Admin User for Production Action Protection
# ========================================================================
# This script creates a working admin user for production deployment
# Handles multiple scenarios and database states
# ========================================================================

set -e

# Configuration (match your deployment script)
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"

# Admin credentials
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_PASSWORD="admin123456"
ADMIN_USERNAME="admin"

echo "🔧 Creating Admin User for Action Protection Production..."
echo "📧 Admin Email: ${ADMIN_EMAIL}"
echo "🔑 Admin Password: ${ADMIN_PASSWORD}"
echo ""

# Check prerequisites
echo "1. Checking prerequisites..."
export PGPASSWORD="${DB_PASSWORD}"

# Test database connection
if ! psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Database connection failed"
    echo "Check database configuration and credentials"
    exit 1
fi

# Check if Node.js is available for bcrypt
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not available"
    echo "Install Node.js: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check if bcryptjs is available
if ! node -e "require('bcryptjs')" 2>/dev/null; then
    echo "❌ bcryptjs not available"
    echo "Install bcryptjs: npm install -g bcryptjs"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Generate password hash
echo ""
echo "2. Generating password hash..."
PASSWORD_HASH=$(node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('${ADMIN_PASSWORD}', 10));
")

if [ -z "$PASSWORD_HASH" ]; then
    echo "❌ Failed to generate password hash"
    exit 1
fi

echo "✅ Password hash generated"

# Create/update admin user
echo ""
echo "3. Creating/updating admin user..."

psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- First, check if users table exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist. Run database migration first.';
    END IF;
END
\$\$;

-- Check table structure and create admin user accordingly
DO \$\$
DECLARE
    has_username boolean;
    has_password boolean;
    admin_exists boolean;
BEGIN
    -- Check if username column exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    ) INTO has_username;
    
    -- Check if password column exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) INTO has_password;
    
    -- Check if admin user already exists
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE email = '${ADMIN_EMAIL}' OR role = 'administrator'
    ) INTO admin_exists;
    
    RAISE NOTICE 'Table structure: username=%, password=%, admin_exists=%', has_username, has_password, admin_exists;
    
    IF NOT has_password THEN
        RAISE EXCEPTION 'Password column missing from users table. Update database schema.';
    END IF;
    
    -- Delete existing admin users to avoid conflicts
    DELETE FROM users WHERE role = 'administrator' OR email = '${ADMIN_EMAIL}';
    
    -- Create admin user based on table structure
    IF has_username THEN
        INSERT INTO users (
            id, username, email, password, first_name, last_name, 
            role, is_active, created_at, updated_at
        ) VALUES (
            'admin_user_' || extract(epoch from now())::text,
            '${ADMIN_USERNAME}',
            '${ADMIN_EMAIL}',
            '${PASSWORD_HASH}',
            'System',
            'Administrator',
            'administrator',
            true,
            NOW(),
            NOW()
        );
    ELSE
        INSERT INTO users (
            id, email, password, first_name, last_name, 
            role, is_active, created_at, updated_at
        ) VALUES (
            'admin_user_' || extract(epoch from now())::text,
            '${ADMIN_EMAIL}',
            '${PASSWORD_HASH}',
            'System',
            'Administrator',
            'administrator',
            true,
            NOW(),
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Admin user created successfully';
END
\$\$;

-- Verify the admin user was created
SELECT 
    id, 
    email, 
    CASE WHEN username IS NOT NULL THEN username ELSE 'N/A' END as username,
    role, 
    is_active,
    CASE WHEN password IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as password_status,
    created_at
FROM users 
WHERE role = 'administrator' OR email = '${ADMIN_EMAIL}'
ORDER BY created_at DESC
LIMIT 1;
SQL_EOF

if [ $? -eq 0 ]; then
    echo "✅ Admin user created successfully!"
    echo ""
    echo "🔐 Admin Login Credentials:"
    echo "   Email: ${ADMIN_EMAIL}"
    echo "   Password: ${ADMIN_PASSWORD}"
    echo "   URL: https://demox.actionprotectionkw.com/admin"
    echo ""
    echo "🧪 Testing login..."
    
    # Test the login by attempting to verify the password
    TEST_RESULT=$(node -e "
    const bcrypt = require('bcryptjs');
    const hash = '${PASSWORD_HASH}';
    const password = '${ADMIN_PASSWORD}';
    console.log(bcrypt.compareSync(password, hash) ? 'PASS' : 'FAIL');
    ")
    
    if [ "$TEST_RESULT" = "PASS" ]; then
        echo "✅ Password verification test passed"
    else
        echo "❌ Password verification test failed"
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: Change the password after first login!"
    echo "⚠️  If login still fails, check application logs: pm2 logs action-protection"
else
    echo "❌ Failed to create admin user"
    echo "Check the database logs above for specific errors"
    exit 1
fi

echo ""
echo "🎉 Admin user setup completed!"