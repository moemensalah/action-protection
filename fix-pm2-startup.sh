#!/bin/bash

# Fix PM2 startup issue for existing deployment
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"
PROJECT_NAME="latelounge"

echo "🔧 Fixing PM2 startup issue..."

cd $PROJECT_DIR

# Check what was actually built
echo "📁 Checking build output..."
if [ -d "dist" ]; then
    echo "Contents of dist directory:"
    ls -la dist/
else
    echo "No dist directory found. Running build..."
    sudo -u $APP_USER npm run build
fi

# Create logs directory
sudo -u $APP_USER mkdir -p logs

# Stop any existing PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Create a working PM2 ecosystem config
sudo -u $APP_USER tee ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
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
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
PM2_EOF

# Check if the built file exists
if [ -f "dist/index.js" ]; then
    echo "✅ Found built application at dist/index.js"
    echo "🚀 Starting application with PM2..."
    sudo -u $APP_USER pm2 start ecosystem.config.js --env production
    sudo -u $APP_USER pm2 save
    echo "✅ PM2 started successfully!"
else
    echo "❌ Built application not found. Trying alternative startup..."
    # Try starting with npm script instead
    sudo -u $APP_USER tee ecosystem-npm.config.js << 'NPM_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'run dev',
    instances: 1,
    exec_mode: 'fork',
    env: {
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
NPM_EOF
    
    echo "🚀 Starting with npm dev script..."
    sudo -u $APP_USER pm2 start ecosystem-npm.config.js
    sudo -u $APP_USER pm2 save
fi

# Show PM2 status
echo "📊 PM2 Status:"
sudo -u $APP_USER pm2 status

echo "✅ PM2 startup fixed! Your application should now be running."