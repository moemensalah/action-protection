#!/bin/bash

# Quick fix for DATABASE_URL issue on production server
cd /home/appuser/latelounge

# Stop PM2 first
pm2 stop all
pm2 delete all

# Create .env file with database connection
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://latelounge_user:secure_password123@localhost:5432/latelounge_db
SESSION_SECRET=your_generated_session_secret_here
REPL_ID=latelounge
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=yourdomain.com
EOF

# Update ecosystem config to use .env file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env_file: './.env',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
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

# Test database connection
echo "Testing database connection..."
psql -h localhost -U latelounge_user -d latelounge_db -c "SELECT 1;" 2>/dev/null && echo "Database connection OK" || echo "Database connection failed"

# Start PM2 with environment file
pm2 start ecosystem.config.cjs --env production
pm2 save

# Show logs
pm2 logs --lines 10

echo "Fix applied. Check if application starts without DATABASE_URL error."