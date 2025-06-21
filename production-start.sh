#!/bin/bash

echo "Starting LateLounge production deployment..."

# Build the application
echo "Building application..."
node deploy-simple.js

# Navigate to production directory
cd dist

# Install production dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing production dependencies..."
    npm install --production --silent
fi

# Stop any existing processes
echo "Stopping existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pm2 delete latelounge-cafe 2>/dev/null || true

# Start with PM2
echo "Starting with PM2..."
pm2 start ../ecosystem.config.cjs --env production

# Save PM2 configuration
pm2 save

# Show status
echo "Deployment complete!"
pm2 status
echo ""
echo "Application is running on port 5000"
echo "Access your site at: http://your-server-ip:5000"
echo ""
echo "Useful commands:"
echo "  View logs: pm2 logs latelounge-cafe"
echo "  Restart: pm2 restart latelounge-cafe"
echo "  Stop: pm2 stop latelounge-cafe"
echo "  Monitor: pm2 monit"