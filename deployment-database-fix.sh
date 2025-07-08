#!/bin/bash

# Database Migration Fix for Deployment
# Run this script if deployment stopped at database migration step

# Configuration (update these to match your deployment)
PROJECT_NAME="action-protection"
APP_USER="acttionprotection"  # Note: appears to be misspelled in your deployment
DB_USER="acttionprotection"
DB_PASSWORD="SECURE_PASSWORD_HERE"  # Use your actual password
DB_NAME="actionprotection_db"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

echo "🔧 Fixing database migration issue..."

# Navigate to project directory
cd /home/${APP_USER}/${PROJECT_NAME}

# Check if database exists and is accessible
echo "📋 Checking database connectivity..."
if sudo -u postgres psql -d ${DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database ${DB_NAME} is accessible"
else
    echo "❌ Database ${DB_NAME} is not accessible"
    echo "Creating database..."
    
    # Create database if it doesn't exist
    sudo -u postgres psql << DB_SETUP_EOF
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
DB_SETUP_EOF
    
    echo "✅ Database created"
fi

# Run database migration with proper environment variable
echo "🗄️ Running database migrations with proper environment..."
sudo -u ${APP_USER} bash -c "export DATABASE_URL='${DATABASE_URL}' && npm run db:push"

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    
    # Continue with admin user creation
    echo "👤 Creating admin user..."
    sudo -u postgres psql -d ${DB_NAME} << ADMIN_EOF
-- Create admin user with proper schema detection
DO \$\$
DECLARE
    has_username boolean;
    has_password boolean;
BEGIN
    -- Check if username column exists
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') INTO has_username;
    -- Check if password column exists  
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') INTO has_password;
    
    IF has_username AND has_password THEN
        -- Full schema with username and password
        INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            'admin',
            'admin@action-protection.com',
            '\$2b\$10\$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
            'System',
            'Administrator',
            'administrator',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    ELSE
        -- Basic schema without username/password columns
        INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            'admin@action-protection.com',
            'System',
            'Administrator',
            'administrator',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE 'Admin user created/updated successfully';
END
\$\$;
ADMIN_EOF

    echo "✅ Admin user created successfully!"
    echo "📋 You can now continue with the deployment process"
    echo "🚀 Next steps:"
    echo "   1. Run PM2 to start the application"
    echo "   2. Configure Nginx"
    echo "   3. Test the application"
    
else
    echo "❌ Database migration failed!"
    echo "🔍 Troubleshooting steps:"
    echo "   1. Check DATABASE_URL: ${DATABASE_URL}"
    echo "   2. Verify database credentials"
    echo "   3. Check if PostgreSQL is running: systemctl status postgresql"
    echo "   4. Test database connection: sudo -u postgres psql -d ${DB_NAME} -c 'SELECT 1;'"
fi