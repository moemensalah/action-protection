#!/bin/bash

# Fix port 3000 conflict and clean up duplicate processes
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔧 Fixing port 3000 conflict..."

cd $PROJECT_DIR

# Kill all processes using port 3000
echo "🛑 Stopping all processes on port 3000..."
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || echo "No processes found on port 3000"

# Stop all PM2 processes
echo "🛑 Stopping all PM2 processes..."
sudo -u $APP_USER pm2 delete all 2>/dev/null || echo "No PM2 processes to stop"

# Kill any remaining Node processes
echo "🛑 Cleaning up Node processes..."
sudo pkill -f "node.*latelounge" 2>/dev/null || echo "No Node processes found"
sudo pkill -f "tsx server" 2>/dev/null || echo "No tsx processes found"

# Wait for processes to terminate
sleep 3

# Verify port is free
echo "🔍 Checking port 3000 availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "❌ Port 3000 still in use. Forcing cleanup..."
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

# Create clean PM2 configuration
echo "📝 Creating clean PM2 configuration..."
sudo -u $APP_USER tee ecosystem.config.cjs << 'CLEAN_PM2_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/appuser/latelounge',
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
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
CLEAN_PM2_EOF

# Clear PM2 logs
echo "🧹 Clearing old logs..."
sudo -u $APP_USER rm -f logs/*.log
sudo -u $APP_USER mkdir -p logs

# Start application cleanly
echo "🚀 Starting application on clean port..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
sudo -u $APP_USER pm2 save

# Wait for startup
sleep 5

# Verify application is running
echo "✅ Checking application status..."
sudo -u $APP_USER pm2 status

echo "🧪 Testing server connectivity..."
if curl -s http://localhost:3000/api/contact >/dev/null; then
    echo "✅ Server responding successfully on port 3000"
else
    echo "⚠️ Server not responding yet, checking logs..."
    sudo -u $APP_USER pm2 logs --lines 10
fi

echo "🎯 Port conflict resolved!"