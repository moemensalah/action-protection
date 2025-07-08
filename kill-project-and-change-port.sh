#!/bin/bash

# Kill Current Project and Change Port Script
# Usage: ./kill-project-and-change-port.sh [NEW_PORT]

NEW_PORT=${1:-3000}
OLD_PORT=${2:-5000}
PROJECT_NAME="actionprotection"

echo "🛑 Stopping current project and freeing ports..."

# 1. Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 delete all 2>/dev/null || echo "No PM2 processes found"
pm2 kill 2>/dev/null || echo "PM2 not running"

# 2. Kill processes on old port (current development port 5000)
echo "Killing processes on port ${OLD_PORT}..."
sudo lsof -ti:${OLD_PORT} | xargs sudo kill -9 2>/dev/null || echo "No processes on port ${OLD_PORT}"

# 3. Kill processes on new port (if any)
echo "Killing processes on port ${NEW_PORT}..."
sudo lsof -ti:${NEW_PORT} | xargs sudo kill -9 2>/dev/null || echo "No processes on port ${NEW_PORT}"

# 4. Kill any Node.js processes related to the project
echo "Killing Node.js processes..."
sudo pkill -f "node.*${PROJECT_NAME}" 2>/dev/null || echo "No Node project processes found"
sudo pkill -f "tsx server" 2>/dev/null || echo "No tsx processes found"
sudo pkill -f "npm run dev" 2>/dev/null || echo "No npm dev processes found"

# 5. Kill Vite development server
echo "Killing Vite processes..."
sudo pkill -f "vite" 2>/dev/null || echo "No Vite processes found"

# 6. Wait for processes to terminate
echo "Waiting for processes to terminate..."
sleep 3

# 7. Verify ports are free
echo "Checking port status..."
if lsof -Pi :${OLD_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port ${OLD_PORT} still in use, forcing cleanup..."
    sudo lsof -ti:${OLD_PORT} | xargs sudo kill -9 2>/dev/null || true
fi

if lsof -Pi :${NEW_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port ${NEW_PORT} still in use, forcing cleanup..."
    sudo lsof -ti:${NEW_PORT} | xargs sudo kill -9 2>/dev/null || true
fi

# 8. Final check
sleep 2
echo "Final port check..."
echo "Port ${OLD_PORT} status:"
lsof -i :${OLD_PORT} 2>/dev/null || echo "Port ${OLD_PORT} is free ✅"

echo "Port ${NEW_PORT} status:"
lsof -i :${NEW_PORT} 2>/dev/null || echo "Port ${NEW_PORT} is free ✅"

echo "✅ Project cleanup completed!"
echo "📋 Next steps:"
echo "   1. Update your configuration files with new port ${NEW_PORT}"
echo "   2. Restart your application"
echo "   3. Update Nginx configuration if needed"