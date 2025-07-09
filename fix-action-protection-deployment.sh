#!/bin/bash

# Fix Action Protection deployment with correct configuration
echo "🔧 Fixing Action Protection Deployment"
echo "====================================="

# Configuration matching your setup
PROJECT_NAME="action-protection"
APP_USER="actionprotection"
APP_PORT="4000"
DATABASE_PORT="5800"
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"

echo "Configuration:"
echo "  Project: ${PROJECT_NAME}"
echo "  User: ${APP_USER}"
echo "  Directory: ${PROJECT_DIR}"
echo "  App Port: ${APP_PORT}"
echo "  Database Port: ${DATABASE_PORT}"
echo ""

# Navigate to project directory
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    echo "✅ Working in: $(pwd)"
else
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Stop existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop action-protection 2>/dev/null || echo "   No existing action-protection process"
pm2 delete action-protection 2>/dev/null || echo "   No existing action-protection process to delete"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "dist/server/index.js" ]; then
    echo "❌ Build failed - dist/server/index.js not found"
    echo "   Build contents:"
    ls -la dist/ 2>/dev/null || echo "   No dist directory"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Create correct ecosystem.config.js
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
EOF

# Verify the script file exists
if [ -f "dist/server/index.js" ]; then
    echo "✅ Script file exists: dist/server/index.js"
else
    echo "❌ Script file missing: dist/server/index.js"
    echo "   Available files in dist:"
    find dist -name "*.js" 2>/dev/null || echo "   No JS files found"
    exit 1
fi

# Start with PM2
echo "🚀 Starting Action Protection with PM2..."
pm2 start ecosystem.config.js

# Wait a moment for startup
sleep 3

# Check status
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🔍 Testing application..."
if curl -f -s "http://localhost:${APP_PORT}" > /dev/null; then
    echo "✅ Application responding on port ${APP_PORT}"
else
    echo "❌ Application not responding on port ${APP_PORT}"
    echo "   Check logs: pm2 logs action-protection"
fi

echo ""
echo "📋 Management Commands:"
echo "  Status: pm2 list"
echo "  Logs: pm2 logs action-protection"
echo "  Restart: pm2 restart action-protection"
echo "  Stop: pm2 stop action-protection"
echo "  Test: curl http://localhost:${APP_PORT}"

echo ""
echo "✅ Action Protection deployment fix complete!"