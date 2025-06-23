#!/bin/bash

# Fix environment variables for PM2 immediately
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔧 Adding DATABASE_URL to PM2 configuration..."

cd $PROJECT_DIR

# Stop current PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Create updated ecosystem config with DATABASE_URL
sudo -u $APP_USER tee ecosystem.config.cjs << 'ENV_CJS_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db'
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
ENV_CJS_EOF

# Restart with environment variables
echo "🚀 Starting application with DATABASE_URL..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
sudo -u $APP_USER pm2 save

echo "📊 PM2 Status:"
sudo -u $APP_USER pm2 status

echo "📋 Environment check:"
sudo -u $APP_USER pm2 env 0

echo "✅ DATABASE_URL added to PM2 configuration!"