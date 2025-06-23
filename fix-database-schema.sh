#!/bin/bash

# Fix database schema and admin user creation
set -e

PROJECT_DIR="/home/appuser/latelounge"
DB_NAME="latelounge"

echo "🔍 Checking actual database schema..."

# Check the users table structure
sudo -u postgres psql -d ${DB_NAME} -c "\d users"

echo ""
echo "📋 Available columns in users table:"
sudo -u postgres psql -d ${DB_NAME} -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"

echo ""
echo "🔧 Creating admin user with correct schema..."

# Create admin user using only existing columns
sudo -u postgres psql -d ${DB_NAME} << 'ADMIN_EOF'
-- Check if user already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'admin_user') THEN
        -- Insert admin user using actual table schema
        INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            'admin@latelounge.sa',
            'System',
            'Administrator',
            'administrator',
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        -- Update existing user
        UPDATE users SET
            email = 'admin@latelounge.sa',
            first_name = 'System',
            last_name = 'Administrator',
            role = 'administrator',
            is_active = true,
            updated_at = NOW()
        WHERE id = 'admin_user';
        RAISE NOTICE 'Admin user updated successfully';
    END IF;
END
$$;

-- Show created user
SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = 'admin_user';
ADMIN_EOF

echo "✅ Admin user setup completed!"
echo "📝 Note: This user may need password setup through the application interface"