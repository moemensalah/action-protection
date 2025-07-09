#!/bin/bash

# ========================================================================
# Direct Admin User Creation in Correct Database
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Creating admin user directly in actionprotection_db..."

cd $PROJECT_DIR

# First, let's check what tables exist in the correct database
echo "1. Checking tables in actionprotection_db..."
sudo -u postgres psql -d actionprotection_db -c "\dt"

# Check if users table exists and its structure
echo ""
echo "2. Checking users table structure..."
sudo -u postgres psql -d actionprotection_db -c "\d users" || echo "Users table not found"

# Check website_users table structure
echo ""
echo "3. Checking website_users table structure..."
sudo -u postgres psql -d actionprotection_db -c "\d website_users" || echo "Website_users table not found"

# Create admin user directly in PostgreSQL
echo ""
echo "4. Creating admin user directly in PostgreSQL..."
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
SELECT id, email, username, role, is_active, created_at FROM users WHERE email = 'admin@actionprotection.com';
EOF

# Test the admin login via API
echo ""
echo "5. Testing admin login via API..."
curl -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "6. Checking all users in the database..."
sudo -u postgres psql -d actionprotection_db -c "SELECT email, username, role, is_active FROM users ORDER BY created_at DESC;"

echo ""
echo "7. Checking website users (the mystery users)..."
sudo -u postgres psql -d actionprotection_db -c "SELECT email, username, created_at FROM website_users ORDER BY created_at DESC;"

echo ""
echo "✅ Admin user creation completed!"
echo ""
echo "📋 Login credentials:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"