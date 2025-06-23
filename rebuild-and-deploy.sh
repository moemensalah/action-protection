#!/bin/bash

# Rebuild application with authentication fixes for production deployment
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"
DATABASE_URL="postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db"
SESSION_SECRET="latelounge-production-session-secret-2024"
DOMAIN_NAME="localhost:3000,127.0.0.1:3000"

echo "🔧 Rebuilding application with authentication fixes..."

cd $PROJECT_DIR

# Stop existing PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Clean and rebuild the application
echo "🏗️ Building application..."
sudo -u $APP_USER npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build successful"

# Create comprehensive PM2 configuration with all environment variables
sudo -u $APP_USER tee ecosystem.config.cjs << 'REBUILD_CONFIG_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/appuser/latelounge',
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000',
      REPL_ID: 'latelounge-production',
      SESSION_SECRET: 'latelounge-production-session-secret-2024',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://latelounge_user:secure_password_123@localhost:5432/latelounge_db',
      REPLIT_DOMAINS: 'localhost:3000,127.0.0.1:3000',
      REPL_ID: 'latelounge-production',
      SESSION_SECRET: 'latelounge-production-session-secret-2024',
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
REBUILD_CONFIG_EOF

# Ensure logs directory exists
sudo -u $APP_USER mkdir -p logs

# Start the application
echo "🚀 Starting application with fixed authentication..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
sudo -u $APP_USER pm2 save

# Wait for startup
echo "⏳ Waiting for application startup..."
sleep 5

# Check status
echo "📊 PM2 Status:"
sudo -u $APP_USER pm2 status

# Show recent logs
echo "📋 Recent application logs:"
sudo -u $APP_USER pm2 logs --lines 15

echo "✅ Application rebuilt and deployed successfully!"
echo "🌐 Your LateLounge application should now be running on port 3000"
echo "👤 Admin access: admin@latelounge.sa"