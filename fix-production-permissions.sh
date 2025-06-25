#!/bin/bash

echo "🔧 LateLounge Production Permissions Fix"
echo "======================================="

# Fix permissions for the entire project directory
echo "📁 Fixing directory permissions..."
sudo chown -R appuser:appuser /home/appuser/latelounge
sudo chmod -R 755 /home/appuser/latelounge

# Fix specific asset directories
echo "🖼️ Fixing asset permissions..."
sudo chmod -R 777 /home/appuser/latelounge/dist/public/assets/ 2>/dev/null || true
sudo chmod -R 777 /home/appuser/latelounge/uploads/ 2>/dev/null || true
sudo chmod -R 777 /home/appuser/latelounge/client/public/assets/ 2>/dev/null || true

# Remove any locked files in dist
echo "🗑️ Cleaning dist directory..."
sudo rm -rf /home/appuser/latelounge/dist/ 2>/dev/null || true

# Clean node_modules cache
echo "📦 Cleaning node modules cache..."
npm cache clean --force

# Reinstall dependencies with proper permissions
echo "📥 Reinstalling dependencies..."
npm install

# Build with proper permissions
echo "🏗️ Building production assets..."
npm run build

# Set final permissions
echo "🔒 Setting final permissions..."
sudo chown -R appuser:appuser /home/appuser/latelounge
sudo chmod -R 755 /home/appuser/latelounge

# Restart PM2
echo "🚀 Restarting PM2..."
pm2 restart latelounge || pm2 start ecosystem.config.js

echo ""
echo "✅ Production permissions fix complete!"
echo ""
echo "📊 Checking PM2 status..."
pm2 status