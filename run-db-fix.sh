#!/bin/bash

cd /home/appuser/latelounge

echo "Fixing database user permissions..."

# Fix database user with your actual credentials
sudo -u postgres psql << 'EOF'
DROP USER IF EXISTS appuser;
CREATE USER appuser WITH PASSWORD 'SAJWJJAHED4E';
DROP DATABASE IF EXISTS latelounge_db;
CREATE DATABASE latelounge_db OWNER appuser;
GRANT ALL PRIVILEGES ON DATABASE latelounge_db TO appuser;
ALTER USER appuser CREATEDB;
\c latelounge_db
GRANT ALL ON SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appuser;
\q
EOF

echo "Testing database connection..."
export DATABASE_URL="postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db"
psql $DATABASE_URL -c "SELECT current_user, current_database();"

echo "Running database migrations..."
npm run db:push

echo "Updating PM2 environment variables..."
pm2 stop all
pm2 delete all

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db',
      SESSION_SECRET: '88HX0HZPT223ZNGGV1QJO4IA3GX5H48B',
      REPL_ID: 'krw1cv',
      ISSUER_URL: 'https://replit.com/oidc',
      REPLIT_DOMAINS: 'demo2.late-lounge.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

pm2 start ecosystem.config.cjs --env production
pm2 save

echo "Testing API..."
sleep 3
curl -s http://localhost:3000/api/categories

echo "Database fix complete!"