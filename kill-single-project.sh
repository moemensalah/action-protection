#!/bin/bash

# Kill Single Project Script
# Usage: ./kill-single-project.sh [PROJECT_NAME] [PORT]

PROJECT_NAME=${1:-"actionprotection"}
PORT=${2:-5000}

echo "🛑 Stopping only project: ${PROJECT_NAME} on port ${PORT}..."

# 1. Stop specific PM2 process only
echo "Stopping PM2 process for ${PROJECT_NAME}..."
pm2 delete "${PROJECT_NAME}" 2>/dev/null || echo "No PM2 process named ${PROJECT_NAME}"

# 2. Kill processes on specific port only
echo "Killing processes on port ${PORT}..."
PORT_PIDS=$(sudo lsof -ti:${PORT} 2>/dev/null)
if [ -n "$PORT_PIDS" ]; then
    echo "Found processes on port ${PORT}: $PORT_PIDS"
    echo "$PORT_PIDS" | xargs sudo kill -9 2>/dev/null
    echo "✅ Killed processes on port ${PORT}"
else
    echo "No processes found on port ${PORT}"
fi

# 3. Kill specific Node.js processes for this project only
echo "Killing Node.js processes for ${PROJECT_NAME}..."
NODE_PIDS=$(pgrep -f "node.*${PROJECT_NAME}" 2>/dev/null)
if [ -n "$NODE_PIDS" ]; then
    echo "Found Node processes for ${PROJECT_NAME}: $NODE_PIDS"
    echo "$NODE_PIDS" | xargs sudo kill -9 2>/dev/null
    echo "✅ Killed Node processes for ${PROJECT_NAME}"
else
    echo "No Node processes found for ${PROJECT_NAME}"
fi

# 4. Kill specific tsx server processes for this project
echo "Killing tsx server processes for ${PROJECT_NAME}..."
TSX_PIDS=$(pgrep -f "tsx.*server.*${PROJECT_NAME}" 2>/dev/null)
if [ -n "$TSX_PIDS" ]; then
    echo "Found tsx processes for ${PROJECT_NAME}: $TSX_PIDS"
    echo "$TSX_PIDS" | xargs sudo kill -9 2>/dev/null
    echo "✅ Killed tsx processes for ${PROJECT_NAME}"
else
    echo "No tsx processes found for ${PROJECT_NAME}"
fi

# 5. Kill npm dev processes in specific directory
echo "Killing npm dev processes for ${PROJECT_NAME}..."
NPM_PIDS=$(pgrep -f "npm run dev" | xargs -I {} sh -c 'ps -p {} -o pid,cmd --no-headers | grep -q "'${PROJECT_NAME}'" && echo {}' 2>/dev/null)
if [ -n "$NPM_PIDS" ]; then
    echo "Found npm dev processes for ${PROJECT_NAME}: $NPM_PIDS"
    echo "$NPM_PIDS" | xargs sudo kill -9 2>/dev/null
    echo "✅ Killed npm dev processes for ${PROJECT_NAME}"
else
    echo "No npm dev processes found for ${PROJECT_NAME}"
fi

# 6. Wait for processes to terminate
echo "Waiting for processes to terminate..."
sleep 2

# 7. Verify port is free
echo "Checking if port ${PORT} is free..."
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️ Port ${PORT} still in use, checking what's using it..."
    lsof -i :${PORT}
    echo "If this is not related to ${PROJECT_NAME}, it will be left running."
else
    echo "✅ Port ${PORT} is now free"
fi

# 8. Show remaining PM2 processes
echo ""
echo "📋 Remaining PM2 processes:"
pm2 list 2>/dev/null || echo "No PM2 processes running"

echo ""
echo "✅ Project ${PROJECT_NAME} cleanup completed!"
echo "📋 Other projects and processes remain untouched."