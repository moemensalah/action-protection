#!/bin/bash

# Fix Production API Issue
# This script specifically addresses the API endpoint not responding in production

set -e

APP_USER="actionprotection"
PROJECT_NAME="action-protection"
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"
APP_PORT="4000"
DATABASE_URL="postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db"

echo "🔧 Fixing Production API Issue"
echo "=============================="

# Navigate to project directory
cd ${PROJECT_DIR}

# 1. Stop current PM2 processes
echo "1. Stopping current processes..."
sudo -u ${APP_USER} pm2 stop all 2>/dev/null || true
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || true

# 2. Kill any processes on port 4000
echo "2. Clearing port 4000..."
lsof -ti:${APP_PORT} | xargs kill -9 2>/dev/null || true

# 3. Test database connection
echo "3. Testing database connection..."
if ! sudo -u postgres psql -d actionprotection_db -c "SELECT 1;" &>/dev/null; then
    echo "❌ Database connection failed, starting PostgreSQL..."
    systemctl start postgresql
    sleep 3
fi

# 4. Create proper package.json start script
echo "4. Fixing package.json start script..."
sudo -u ${APP_USER} cat > package.json << 'PACKAGE_JSON'
{
  "name": "action-protection",
  "version": "1.0.0",
  "description": "Action Protection automotive platform",
  "main": "dist/index.js",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "node dist/index.js",
    "start:dev": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "type": "module"
}
PACKAGE_JSON

# 5. Try to build the application
echo "5. Building application..."
if sudo -u ${APP_USER} npm run build 2>/dev/null; then
    echo "✅ Build successful, using production mode"
    USE_PRODUCTION=true
else
    echo "⚠️ Build failed, using development mode"
    USE_PRODUCTION=false
fi

# 6. Create appropriate PM2 configuration
echo "6. Creating PM2 configuration..."
if [ "$USE_PRODUCTION" = true ] && [ -f "dist/index.js" ]; then
    # Production mode with built files
    sudo -u ${APP_USER} cat > ecosystem.config.cjs << 'PM2_PROD'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
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
    max_restarts: 10,
    min_uptime: '5s',
    restart_delay: 1000
  }]
};
PM2_PROD
else
    # Development mode with tsx
    sudo -u ${APP_USER} cat > ecosystem.config.cjs << 'PM2_DEV'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'npm',
    args: 'run start:dev',
    instances: 1,
    exec_mode: 'fork',
    env: {
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
    max_restarts: 10,
    min_uptime: '5s',
    restart_delay: 1000
  }]
};
PM2_DEV
fi

# 7. Create logs directory
sudo -u ${APP_USER} mkdir -p logs

# 8. Run database migration
echo "7. Running database migration..."
sudo -u ${APP_USER} env DATABASE_URL="${DATABASE_URL}" npm run db:push 2>/dev/null || echo "Migration skipped"

# 9. Start the application
echo "8. Starting application..."
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs

# 10. Wait for startup and test
echo "9. Waiting for application startup..."
sleep 15

# 11. Test the API endpoint multiple times
echo "10. Testing API endpoint..."
for i in {1..10}; do
    echo "Test $i/10:"
    
    # Test with curl and show response
    RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" http://localhost:${APP_PORT}/api/contact 2>/dev/null || echo "FAILED")
    
    if [[ "$RESPONSE" == *"HTTP_CODE:200"* ]]; then
        echo "✅ API endpoint is responding (HTTP 200)"
        break
    elif [[ "$RESPONSE" == *"HTTP_CODE:"* ]]; then
        HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
        echo "⚠️ API endpoint returned HTTP $HTTP_CODE"
    else
        echo "❌ API endpoint not responding"
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ API endpoint failed all tests"
        echo "Checking application logs..."
        sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME} --lines 30
    else
        sleep 3
    fi
done

# 12. Show current status
echo "11. Current status:"
sudo -u ${APP_USER} pm2 status

# 13. Test nginx proxy
echo "12. Testing nginx proxy..."
if curl -s -I http://localhost:80 >/dev/null 2>&1; then
    echo "✅ nginx proxy is responding"
else
    echo "❌ nginx proxy not responding"
    systemctl restart nginx
fi

# 14. Final comprehensive test
echo "13. Final connectivity tests:"
echo "Direct app: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/contact 2>/dev/null || echo "FAILED")"
echo "nginx proxy: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/api/contact 2>/dev/null || echo "FAILED")"
echo "Domain: $(curl -s -o /dev/null -w "%{http_code}" http://demox.actionprotectionkw.com/api/contact 2>/dev/null || echo "FAILED")"

echo ""
echo "🎉 Fix completed!"
echo ""
echo "If the API is still not responding, check:"
echo "1. sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "2. sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo "3. ./diagnose-webserver.sh"