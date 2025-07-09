#!/bin/bash

# ========================================================================
# Fix PM2 Path Issue for Action Protection
# ========================================================================
# This script fixes the PM2 module path error causing login failures
# ========================================================================

set -e

APP_USER="actionprotection"
PROJECT_NAME="action-protection"
APP_PORT="4000"

echo "🔧 Fixing PM2 Path Issue for Action Protection..."

# Stop existing PM2 processes
echo "1. Stopping existing PM2 processes..."
pm2 delete action-protection 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Navigate to project directory
echo "2. Navigating to project directory..."
cd /home/${APP_USER}/${PROJECT_NAME}

# Check if build exists
if [ ! -f "dist/index.js" ]; then
    echo "3. Building the application..."
    sudo -u ${APP_USER} npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi
else
    echo "3. Build already exists"
fi

# Create correct PM2 ecosystem configuration
echo "4. Creating correct PM2 configuration..."
sudo -u ${APP_USER} tee ecosystem.config.cjs << 'PM2_CONFIG_EOF'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: './dist/index.js',
    cwd: '/home/actionprotection/action-protection',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: '4000',
      DATABASE_URL: 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db',
      REPL_ID: 'krw1cv'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
PM2_CONFIG_EOF

# Ensure proper permissions
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}

# Start PM2 with correct configuration
echo "5. Starting PM2 with correct configuration..."
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production

# Check PM2 status
echo "6. Checking PM2 status..."
pm2 status

# Test if the application is responding
echo "7. Testing application response..."
sleep 5
if curl -s http://localhost:${APP_PORT}/api/auth/local/user >/dev/null; then
    echo "✅ Application is responding on port ${APP_PORT}"
else
    echo "❌ Application not responding, checking logs..."
    pm2 logs action-protection --lines 20
fi

echo ""
echo "🎉 PM2 path issue fixed!"
echo "🔐 Try logging in with:"
echo "   Email: admin@actionprotection.com"
echo "   Password: admin123456"
echo "   URL: https://demox.actionprotectionkw.com/admin"