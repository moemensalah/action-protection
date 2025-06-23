#!/bin/bash

echo "=== FIXING DATABASE USER ==="

# Switch to postgres user and create/fix the database user
sudo -u postgres psql << 'EOF'
-- Drop user if exists and recreate
DROP USER IF EXISTS latelounge_user;
CREATE USER latelounge_user WITH PASSWORD 'secure_password123';

-- Drop database if exists and recreate
DROP DATABASE IF EXISTS latelounge_db;
CREATE DATABASE latelounge_db OWNER latelounge_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE latelounge_db TO latelounge_user;
ALTER USER latelounge_user CREATEDB;

-- Connect to the database and grant schema permissions
\c latelounge_db
GRANT ALL ON SCHEMA public TO latelounge_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO latelounge_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO latelounge_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO latelounge_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO latelounge_user;

-- Exit
\q
EOF

# Test connection
echo "Testing database connection:"
export DATABASE_URL="postgresql://latelounge_user:secure_password123@localhost:5432/latelounge_db"
psql $DATABASE_URL -c "SELECT current_user, current_database();"

if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
    
    # Change to app directory and run migrations
    cd /home/appuser/latelounge
    
    echo "Running database migrations:"
    npm run db:push
    
    echo "Checking created tables:"
    psql $DATABASE_URL -c "\dt"
    
    echo "Restarting PM2:"
    pm2 restart all
    
    echo "Testing API:"
    sleep 2
    curl -s http://localhost:3000/api/categories
    
else
    echo "✗ Database connection still failing"
fi

echo "=== DATABASE FIX COMPLETE ==="