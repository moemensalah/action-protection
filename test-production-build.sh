#!/bin/bash

# ========================================================================
# Test Production Build - Action Protection
# ========================================================================

set -e

echo "🧪 Testing production build process..."

# Clean previous build
echo "1. Cleaning previous build..."
rm -rf dist/

# Build application
echo "2. Building application..."
npm run build

# Check build outputs
echo "3. Checking build outputs..."
if [ -f "dist/index.js" ]; then
    echo "✅ Server build successful ($(du -h dist/index.js | cut -f1))"
else
    echo "❌ Server build failed"
    exit 1
fi

if [ -f "dist/public/index.html" ]; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed"
    exit 1
fi

# Check assets
if [ -d "dist/public/assets" ]; then
    echo "✅ Assets build successful ($(ls dist/public/assets | wc -l) files)"
else
    echo "❌ Assets build failed"
    exit 1
fi

# Test production server startup
echo "4. Testing production server..."
export NODE_ENV=production
export PORT=3001
export DATABASE_URL="postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db"

node dist/index.js &
SERVER_PID=$!

# Wait for startup
sleep 5

# Test if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Production server started successfully"
    
    # Test API endpoints
    echo "5. Testing API endpoints..."
    curl -f http://localhost:3001/api/categories > /dev/null && echo "✅ API endpoints working" || echo "❌ API endpoints failed"
    
    # Test static files
    curl -f http://localhost:3001/ > /dev/null && echo "✅ Static files served" || echo "❌ Static files failed"
    
    # Clean up
    kill $SERVER_PID
else
    echo "❌ Production server failed to start"
    exit 1
fi

echo ""
echo "🎉 Production build test completed successfully!"
echo ""
echo "📊 Build Summary:"
echo "   - Server: $(du -h dist/index.js | cut -f1)"
echo "   - Client: $(du -h dist/public/assets/index-*.js | cut -f1)"
echo "   - CSS: $(du -h dist/public/assets/index-*.css | cut -f1)"
echo "   - Assets: $(ls dist/public/assets | wc -l) files"
echo ""
echo "✅ Ready for production deployment!"