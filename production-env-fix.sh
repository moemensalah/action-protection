#!/bin/bash

# Production environment variable fix for Ubuntu deployment
# Run this on your Ubuntu server to fix the missing environment variables

set -e

# Configuration
PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"
DOMAIN_NAME="your-domain.com"  # Replace with your actual domain
DATABASE_URL="postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db"
SESSION_SECRET="your-super-secret-session-key-for-production-2024"

echo "Fixing PM2 environment variables for production..."

cd $PROJECT_DIR

# Stop all PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Create corrected ecosystem config with all required environment variables
sudo -u $APP_USER tee ecosystem.config.cjs << 'PROD_CONFIG_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000,your-domain.com',
      REPL_ID: 'latelounge-production',
      SESSION_SECRET: 'your-super-secret-session-key-for-production-2024',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000,your-domain.com',
      REPL_ID: 'latelounge-production',
      SESSION_SECRET: 'your-super-secret-session-key-for-production-2024',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    cwd: '/home/appuser/latelounge'
  }]
};
PROD_CONFIG_EOF

echo "Starting application with corrected environment variables..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
sudo -u $APP_USER pm2 save

echo "PM2 Status:"
sudo -u $APP_USER pm2 status

echo "Checking logs for startup success..."
sleep 3
sudo -u $APP_USER pm2 logs --lines 10

echo "Environment variables fix completed!"
echo "If you see the application running without errors, the fix was successful."
echo "Your LateLounge application should now be accessible on port 3000."