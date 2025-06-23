#!/bin/bash

# Quick fix for Rollup build issue in existing deployment
# Run this script if you encounter the @rollup/rollup-linux-x64-gnu error

set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔧 Fixing Rollup build issue..."

# Navigate to project directory
cd $PROJECT_DIR

# Clean problematic files
echo "Cleaning node_modules and package-lock.json..."
sudo -u $APP_USER rm -rf node_modules package-lock.json

# Clear npm cache
echo "Clearing npm cache..."
sudo -u $APP_USER npm cache clean --force

# Reinstall dependencies with specific Rollup fix
echo "Reinstalling dependencies..."
sudo -u $APP_USER npm install

# Force install the missing Rollup dependency
echo "Installing missing Rollup dependency..."
sudo -u $APP_USER npm install @rollup/rollup-linux-x64-gnu --save-optional

# Try building again
echo "Attempting build..."
if sudo -u $APP_USER npm run build; then
    echo "✅ Build successful!"
else
    echo "Build still failing, trying alternative method..."
    sudo -u $APP_USER npx vite build --force
fi

# Restart PM2 if application is running
if sudo -u $APP_USER pm2 list | grep -q "latelounge"; then
    echo "Restarting application..."
    sudo -u $APP_USER pm2 restart latelounge
fi

echo "🎉 Rollup issue fixed and application updated!"