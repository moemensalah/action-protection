#!/bin/bash

# PM2 Deployment Script for LateLounge Cafe
set -e

echo "🚀 Starting PM2 deployment for LateLounge..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🏗️ Building application..."
node deploy-simple.js

# Create logs directory
mkdir -p logs

# Stop existing PM2 process if running
echo "🔄 Stopping existing processes..."
pm2 stop latelounge-cafe 2>/dev/null || true
pm2 delete latelounge-cafe 2>/dev/null || true

# Start with PM2
echo "▶️ Starting application with PM2..."
NODE_ENV=production pm2 start ecosystem.config.cjs --env production

# Save PM2 configuration
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔗 Application should be running on:"
echo "   http://localhost:5000"
echo "   API: http://localhost:5000/api/categories"

echo ""
echo "📋 Useful PM2 commands:"
echo "   pm2 logs latelounge-cafe    # View logs"
echo "   pm2 restart latelounge-cafe # Restart app"
echo "   pm2 stop latelounge-cafe    # Stop app"
echo "   pm2 monit                   # Monitor resources"