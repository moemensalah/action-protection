#!/bin/bash

# Fix all missing environment variables for PM2
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔧 Adding all required environment variables to PM2..."

cd $PROJECT_DIR

# Stop current PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Create comprehensive ecosystem config with all required environment variables
sudo -u $APP_USER tee ecosystem.config.cjs << 'ALL_ENV_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000',
      REPL_ID: 'latelounge-production',
      SESSION_SECRET: 'your-super-secret-session-key-for-production-2024',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000',
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
    ignore_watch: ['node_modules', 'logs']
  }]
};
ALL_ENV_EOF

# Restart with all environment variables
echo "🚀 Starting application with all required environment variables..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
sudo -u $APP_USER pm2 save

echo "📊 PM2 Status:"
sudo -u $APP_USER pm2 status

echo "⏳ Waiting 5 seconds for startup..."
sleep 5

echo "📋 Checking application logs:"
sudo -u $APP_USER pm2 logs --lines 10

echo "✅ All environment variables configured!"