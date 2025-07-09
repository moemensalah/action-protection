#!/bin/bash

# Start Action Protection project properly
echo "🚀 Starting Action Protection..."
echo "================================"

# Navigate to project directory
cd /home/actionprotection/action-protection

# Check if project files exist
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the right directory?"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "dist/server/index.js" ]; then
    echo "❌ Build failed - dist/server/index.js not found"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start with PM2
echo "🎯 Starting with PM2..."
pm2 start ecosystem.config.js

# Show status
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "✅ Action Protection started!"
echo "   Process: actionprotection"
echo "   Port: 3000"
echo "   Logs: pm2 logs actionprotection"
echo "   Test: curl http://localhost:3000"