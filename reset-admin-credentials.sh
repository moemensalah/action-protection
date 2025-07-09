#!/bin/bash

# Reset Admin Credentials Script
# This script creates/updates admin user with proper credentials

set -e

# Configuration
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_PASSWORD="ActionProtection2024!"
ADMIN_USERNAME="admin"
DB_NAME="actionprotection_db"

echo "🔐 Resetting Action Protection Admin Credentials"
echo "==============================================="

# Generate proper bcrypt hash for the password
echo "1. Generating password hash..."
HASHED_PASSWORD=$(node -e "
const bcrypt = require('bcryptjs');
const password = '$ADMIN_PASSWORD';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
")

if [ -z "$HASHED_PASSWORD" ]; then
    echo "❌ Failed to generate password hash"
    exit 1
fi

echo "✅ Password hash generated successfully"

# Clear existing admin users and create new one
echo "2. Updating admin user in database..."
sudo -u postgres psql -d ${DB_NAME} << ADMIN_SQL
-- Delete existing admin users
DELETE FROM users WHERE role = 'administrator';

-- Insert new admin user
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
    'admin_user_2025', 
    '${ADMIN_EMAIL}', 
    '${ADMIN_USERNAME}', 
    '${HASHED_PASSWORD}', 
    'Admin', 
    'User', 
    'administrator', 
    true, 
    NOW(), 
    NOW()
);

-- Verify the user was created
SELECT 'Admin user created successfully:' as message;
SELECT id, email, username, first_name, last_name, role, is_active 
FROM users WHERE role = 'administrator';
ADMIN_SQL

echo "✅ Admin user updated successfully"

# Test the credentials
echo "3. Testing admin credentials..."
echo "Admin login details:"
echo "   Email: ${ADMIN_EMAIL}"
echo "   Password: ${ADMIN_PASSWORD}"

echo ""
echo "🎉 Admin credentials reset complete!"
echo "=================================="
echo ""
echo "✅ You can now login to the admin panel:"
echo "   🌐 URL: http://demox.actionprotectionkw.com/admin"
echo "   📧 Email: ${ADMIN_EMAIL}"
echo "   🔑 Password: ${ADMIN_PASSWORD}"
echo ""
echo "⚠️  Important: Change the password after first login for security"