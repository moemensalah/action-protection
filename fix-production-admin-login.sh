#!/bin/bash

# ========================================================================
# Fix Admin Login for Production Action Protection Deployment
# ========================================================================
# This script fixes the admin user login issue in production
# Run this on your Ubuntu server after deployment
# ========================================================================

set -e

# Configuration (match your deployment script)
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DB_NAME="actionprotection_db"
DATABASE_PORT="5432"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DATABASE_PORT}/${DB_NAME}"

# Admin credentials (from deployment script)
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_PASSWORD="admin123456"

echo "🔧 Fixing Admin Login for Action Protection Production..."
echo "📧 Admin Email: ${ADMIN_EMAIL}"
echo "🔑 Admin Password: ${ADMIN_PASSWORD}"
echo ""

# Generate correct bcrypt hash for the password
echo "🔐 Generating correct password hash..."
CORRECT_HASH=$(node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('${ADMIN_PASSWORD}', 10));
")

echo "✅ Password hash generated"

# Update admin user in database
echo "🗄️ Updating admin user in database..."
export PGPASSWORD="${DB_PASSWORD}"

psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} << SQL_EOF
-- Update admin user with correct password hash
UPDATE users 
SET password = '${CORRECT_HASH}',
    email = '${ADMIN_EMAIL}',
    is_active = true,
    updated_at = NOW()
WHERE role = 'administrator' OR id = 'admin_user';

-- Verify the update
SELECT id, email, role, is_active, created_at, updated_at 
FROM users 
WHERE role = 'administrator' OR id = 'admin_user';
SQL_EOF

if [ $? -eq 0 ]; then
    echo "✅ Admin user updated successfully!"
    echo ""
    echo "🔐 Working Admin Credentials:"
    echo "   Email: ${ADMIN_EMAIL}"
    echo "   Password: ${ADMIN_PASSWORD}"
    echo "   URL: https://demox.actionprotectionkw.com/admin"
    echo ""
    echo "⚠️  IMPORTANT: Change the password after first login!"
else
    echo "❌ Failed to update admin user"
    echo "Please check:"
    echo "1. PostgreSQL is running: systemctl status postgresql"
    echo "2. Database exists: psql -h localhost -p ${DATABASE_PORT} -U ${DB_USER} -d ${DB_NAME} -c '\\l'"
    echo "3. Application is running: pm2 status"
    exit 1
fi

echo ""
echo "🎉 Admin login fix completed!"
echo "You can now login to the admin panel with the credentials above."