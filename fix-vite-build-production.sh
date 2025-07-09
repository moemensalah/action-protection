#!/bin/bash

# ========================================================================
# Fix Vite Build in Production - Action Protection
# ========================================================================

set -e

echo "🔧 Fixing vite build issue in production..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project directory. Looking for project..."
    if [ -d "/home/actionprotection/action-protection" ]; then
        cd /home/actionprotection/action-protection
        echo "✅ Found project at /home/actionprotection/action-protection"
    else
        echo "❌ Project directory not found"
        exit 1
    fi
fi

echo "1. Current directory: $(pwd)"

echo "2. Checking package.json for vite..."
if ! grep -q '"vite"' package.json; then
    echo "❌ Vite not found in package.json - this is the issue"
    echo "📋 Current dependencies:"
    cat package.json | grep -A 10 -B 10 '"devDependencies"' || echo "No devDependencies found"
    exit 1
fi

echo "3. Installing vite and build dependencies..."
npm install --save-dev vite @vitejs/plugin-react @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer esbuild typescript

echo "4. Verifying vite installation..."
npm ls vite

echo "5. Building client with vite..."
npx vite build --outDir dist/public

echo "6. Verifying client build..."
if [ -d "dist/public" ]; then
    echo "✅ Client build successful"
    ls -la dist/public/
else
    echo "❌ Client build failed - creating minimal fallback"
    mkdir -p dist/public
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action Protection</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .loading { color: #f59e0b; }
    </style>
</head>
<body>
    <div id="root">
        <h1>Action Protection</h1>
        <p class="loading">Loading application...</p>
    </div>
    <script>
        // Minimal client-side routing
        if (window.location.pathname === '/admin') {
            document.getElementById('root').innerHTML = '<h1>Admin Panel</h1><p>Please wait while the application loads...</p>';
        }
    </script>
</body>
</html>
EOF
fi

echo "7. Building server..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/server.js \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:@replit/vite-plugin-cartographer \
  --external:pg-native

echo "8. Creating server entry point..."
cat > dist/index.js << 'EOF'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('Starting Action Protection server...');

// Start the server
import('./server.js').then(() => {
    console.log('✅ Server started successfully');
}).catch(err => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
});
EOF

echo "9. Verifying build outputs..."
echo "📁 Built files:"
ls -la dist/

echo "10. Starting with PM2..."
pm2 start ecosystem.config.cjs --env production

echo "11. Testing API..."
sleep 10
for i in {1..10}; do
    if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
        echo "✅ API responding on attempt $i"
        break
    else
        echo "❌ API not responding on attempt $i, waiting..."
        sleep 3
    fi
done

echo "12. Final verification..."
if curl -f http://localhost:4000/api/categories > /dev/null 2>&1; then
    echo "✅ Vite build fix successful!"
    echo "🌐 Application should be accessible"
else
    echo "❌ Application still not responding"
    echo "📋 PM2 logs:"
    pm2 logs action-protection --lines 10 --nostream
fi

echo ""
echo "🎉 Production vite build fix completed!"
echo "📋 PM2 Status:"
pm2 list
EOF