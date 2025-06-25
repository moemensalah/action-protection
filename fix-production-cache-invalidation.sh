#!/bin/bash

echo "🔧 LateLounge Production Cache Invalidation Fix"
echo "==============================================="

echo "📦 Updating production code with cache invalidation fixes..."

# Stop PM2 application
echo "🛑 Stopping PM2 application..."
pm2 stop latelounge

# Pull latest changes (if using git)
echo "📥 Updating codebase..."
# git pull origin main  # Uncomment if using git

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Build production assets
echo "🏗️ Building production assets..."
npm run build

# Restart PM2 application
echo "🚀 Restarting PM2 application..."
pm2 start latelounge

# Check status
echo "📊 Checking PM2 status..."
pm2 status

echo ""
echo "✅ Production cache invalidation fix complete!"
echo ""
echo "🔍 Test the real-time updates in admin panel:"
echo "   1. Go to admin panel > Categories"
echo "   2. Create, edit, or delete a category"
echo "   3. Verify changes appear instantly without page refresh"
echo "   4. Check Products section as well"