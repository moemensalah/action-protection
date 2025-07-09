#!/bin/bash

# Fix deployment naming issues and restart properly
echo "🔧 Fixing Action Protection deployment naming..."
echo "==============================================="

# Stop old latelounge process
echo "1. Stopping old latelounge process..."
pm2 stop latelounge 2>/dev/null || echo "   latelounge process not found"
pm2 delete latelounge 2>/dev/null || echo "   latelounge process not registered"

# Check current working directory
echo "2. Checking current directory..."
if [ -d "/home/actionprotection/action-protection" ]; then
    cd /home/actionprotection/action-protection
    echo "   Working in: $(pwd)"
else
    echo "   Error: Project directory not found"
    exit 1
fi

# Install dependencies if missing
echo "3. Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   Dependencies already installed"
fi

# Build project if needed
echo "4. Building project..."
if [ ! -d "dist" ]; then
    npm run build
else
    echo "   Build directory exists"
fi

# Start with correct name
echo "5. Starting actionprotection process..."
pm2 start ecosystem.config.js

# Show status
echo "6. Current PM2 status:"
pm2 list

echo ""
echo "✅ Deployment fixed!"
echo "   Process name: actionprotection"
echo "   Check status: pm2 list"
echo "   Check logs: pm2 logs actionprotection"
echo "   Access app: curl http://localhost:3000"