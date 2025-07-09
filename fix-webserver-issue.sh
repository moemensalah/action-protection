#!/bin/bash

# Fix Webserver Issue Script
# This script addresses the API endpoint not responding issue

set -e

APP_USER="actionprotection"
PROJECT_NAME="action-protection"
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"
APP_PORT="4000"

echo "🔧 Fixing Action Protection Webserver Issue"
echo "=========================================="

# Stop the application
echo "1. Stopping current application..."
sudo -u ${APP_USER} pm2 stop ${PROJECT_NAME} 2>/dev/null || echo "Process not running"

# Check and kill any processes on port 4000
echo "2. Clearing port 4000..."
lsof -ti:${APP_PORT} | xargs kill -9 2>/dev/null || echo "No processes to kill"

# Navigate to project directory
cd ${PROJECT_DIR}

# Check if database is accessible
echo "3. Testing database connection..."
if sudo -u postgres psql -d actionprotection_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Starting PostgreSQL service..."
    systemctl start postgresql
    sleep 3
fi

# Fix environment variables in PM2 config
echo "4. Updating PM2 configuration..."
sudo -u ${APP_USER} cat > ecosystem.config.cjs << 'PM2_CONFIG'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db',
      REPLIT_DOMAINS: 'demox.actionprotectionkw.com,www.demox.actionprotectionkw.com,localhost:4000,127.0.0.1:4000',
      REPL_ID: 'krw1cv',
      SESSION_SECRET: 'actionprotection-production-session-secret-2025',
      ISSUER_URL: 'https://replit.com/oidc'
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
PM2_CONFIG

# If production build doesn't exist, create development config
if [ ! -f "./dist/index.js" ]; then
    echo "5. No production build found, using development mode..."
    sudo -u ${APP_USER} cat > ecosystem.config.cjs << 'PM2_DEV_CONFIG'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db',
      REPLIT_DOMAINS: 'demox.actionprotectionkw.com,www.demox.actionprotectionkw.com,localhost:4000,127.0.0.1:4000',
      REPL_ID: 'krw1cv',
      SESSION_SECRET: 'actionprotection-production-session-secret-2025',
      ISSUER_URL: 'https://replit.com/oidc'
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
PM2_DEV_CONFIG
fi

# Create logs directory
sudo -u ${APP_USER} mkdir -p logs

# Clear previous logs
sudo -u ${APP_USER} rm -f logs/*.log

# Try to build the application
echo "6. Attempting to build application..."
if sudo -u ${APP_USER} npm run build; then
    echo "✅ Build successful"
else
    echo "⚠️ Build failed, continuing with development mode"
fi

# Start the application
echo "7. Starting application..."
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production

# Wait for startup
echo "8. Waiting for application to start..."
sleep 10

# Test the application
echo "9. Testing application..."
for i in {1..5}; do
    echo "Attempt $i: Testing API endpoint..."
    if curl -s http://localhost:${APP_PORT}/api/contact >/dev/null 2>&1; then
        echo "✅ API endpoint is responding"
        break
    else
        echo "⏳ Waiting..."
        sleep 5
    fi
done

# Show application logs
echo "10. Application logs:"
sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME} --lines 20

# Show PM2 status
echo "11. PM2 status:"
sudo -u ${APP_USER} pm2 status

# Restart nginx to ensure proxy is working
echo "12. Restarting nginx..."
systemctl restart nginx

# Final test
echo "13. Final connectivity test:"
echo "Testing localhost:4000..."
curl -I http://localhost:4000 2>/dev/null || echo "❌ Direct connection failed"

echo "Testing nginx proxy (port 80)..."
curl -I http://localhost:80 2>/dev/null || echo "❌ Proxy connection failed"

echo "Testing domain..."
curl -I http://demox.actionprotectionkw.com 2>/dev/null || echo "❌ Domain connection failed"

echo ""
echo "🎉 Fix attempt completed!"
echo "Check the logs above for any errors."
echo ""
echo "If the issue persists, run:"
echo "  sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "  ./diagnose-webserver.sh"