#!/bin/bash

# Check PM2 logs and application status
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

echo "🔍 Checking PM2 status and logs..."

cd $PROJECT_DIR

echo "📊 Current PM2 Status:"
sudo -u $APP_USER pm2 status || echo "No PM2 processes running"

echo ""
echo "📋 PM2 List with details:"
sudo -u $APP_USER pm2 list || echo "No PM2 processes found"

echo ""
echo "🔍 Last 50 lines of error logs:"
if [ -f "logs/err.log" ]; then
    tail -50 logs/err.log
else
    echo "No error log file found at logs/err.log"
fi

echo ""
echo "📝 Last 50 lines of output logs:"
if [ -f "logs/out.log" ]; then
    tail -50 logs/out.log
else
    echo "No output log file found at logs/out.log"
fi

echo ""
echo "🔧 Last 50 lines of combined logs:"
if [ -f "logs/combined.log" ]; then
    tail -50 logs/combined.log
else
    echo "No combined log file found at logs/combined.log"
fi

echo ""
echo "📁 Contents of logs directory:"
ls -la logs/ 2>/dev/null || echo "No logs directory found"

echo ""
echo "🏗️ Checking build output:"
if [ -f "dist/index.js" ]; then
    echo "✅ Built application exists at dist/index.js"
    echo "File size: $(du -h dist/index.js)"
else
    echo "❌ Built application not found at dist/index.js"
    echo "Contents of dist directory:"
    ls -la dist/ 2>/dev/null || echo "No dist directory found"
fi

echo ""
echo "🔍 Checking PM2 logs directly:"
sudo -u $APP_USER pm2 logs --lines 30 || echo "No PM2 logs available"