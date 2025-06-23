#!/bin/bash

# Simple admin user creation using direct SQL without external dependencies
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"
DB_NAME="latelounge"
DB_USER="appuser"

echo "👤 Creating admin user directly via PostgreSQL..."

# Create admin user using SQL directly
sudo -u postgres psql -d ${DB_NAME} << 'EOF'
-- Create admin user with bcrypt hash for password "admin123456"
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_user',
  'admin', 
  'admin@latelounge.sa',
  '$2b$10$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
  'System',
  'Administrator',
  'administrator',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Verify user was created
SELECT username, email, role, "isActive" FROM users WHERE username = 'admin';
EOF

echo "✅ Admin user created successfully!"
echo "🔑 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123456"
echo "   Access: https://your-domain/admin"

echo "🎉 You can now log in to the admin panel!"