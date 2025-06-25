#!/bin/bash

echo "🔧 Quick Build Permissions Fix"
echo "=============================="

# Stop PM2 first
echo "🛑 Stopping PM2..."
pm2 stop latelounge 2>/dev/null || true

# Fix permissions for dist and uploads
echo "📁 Fixing build directory permissions..."
sudo rm -rf /home/appuser/latelounge/dist/ 2>/dev/null || true
sudo chown -R appuser:appuser /home/appuser/latelounge/uploads/ 2>/dev/null || true
sudo chmod -R 755 /home/appuser/latelounge/uploads/ 2>/dev/null || true

# Clean and rebuild
echo "🏗️ Rebuilding..."
npm run build

# Start PM2
echo "🚀 Starting PM2..."
pm2 start latelounge

echo "✅ Build permissions fixed!"