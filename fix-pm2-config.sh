#!/bin/bash

# Fix PM2 configuration file format issue
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔧 Fixing PM2 configuration format..."

cd $PROJECT_DIR

# Remove malformed config file
sudo -u $APP_USER rm -f ecosystem.config.js

# Create properly formatted .cjs config file for CommonJS
sudo -u $APP_USER tee ecosystem.config.cjs << 'CJS_EOF'
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
CJS_EOF

# Stop any existing PM2 processes
sudo -u $APP_USER pm2 delete all 2>/dev/null || true

# Check if built application exists
if [ -f "dist/index.js" ]; then
    echo "✅ Starting built application with corrected config..."
    sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production
else
    echo "⚠️ No built application found, starting with TypeScript..."
    # Create development config for TypeScript
    sudo -u $APP_USER tee ecosystem-dev.config.cjs << 'DEV_CJS_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'server/index.ts',
    interpreter: 'tsx',
    instances: 1,
    exec_mode: 'fork',
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
DEV_CJS_EOF
    sudo -u $APP_USER pm2 start ecosystem-dev.config.cjs --env production
fi

sudo -u $APP_USER pm2 save

echo "📊 PM2 Status:"
sudo -u $APP_USER pm2 status

echo "✅ PM2 configuration fixed and application started!"