#!/bin/bash

# ========================================================================
# Test Action Protection in Production Mode
# ========================================================================

set -e

echo "🚀 Testing Action Protection in production mode..."

# Stop development server and start production
echo "1. Stopping development server..."
pkill -f "tsx server/index.ts" || true
sleep 2

# Set production environment
export NODE_ENV=production
export PORT=4000

# Start production server
echo "2. Starting production server..."
NODE_ENV=production PORT=4000 node dist/index.js > production.log 2>&1 &
SERVER_PID=$!

# Wait for startup
echo "3. Waiting for server startup..."
sleep 10

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Production server started (PID: $SERVER_PID)"
else
    echo "❌ Production server failed to start"
    cat production.log 2>/dev/null || echo "No log file found"
    exit 1
fi

# Test API endpoints
echo "4. Testing API endpoints..."

echo "Testing categories:"
curl -s http://localhost:4000/api/categories | head -3 || echo "Failed"

echo "Testing products:"
curl -s http://localhost:4000/api/products | head -3 || echo "Failed"

echo "Testing hero section:"
curl -s http://localhost:4000/api/hero-section | head -3 || echo "Failed"

echo "Testing contact info:"
curl -s http://localhost:4000/api/contact | head -3 || echo "Failed"

echo "Testing static files:"
curl -s -I http://localhost:4000/ || echo "Failed"

echo "Testing admin login:"
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' || echo "Failed"

# Check server logs
echo "5. Checking server logs..."
tail -20 production.log

# Clean up
echo "6. Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Production mode test completed!"
echo "Server logs available in: production.log"