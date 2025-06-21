#!/bin/bash

echo "Starting LateLounge with PM2..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop any existing PM2 processes
pm2 stop latelounge-cafe 2>/dev/null || true
pm2 delete latelounge-cafe 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Show status
pm2 status

echo ""
echo "LateLounge started successfully!"
echo "View logs: pm2 logs latelounge-cafe"
echo "Monitor: pm2 monit"
echo "Stop: pm2 stop latelounge-cafe"
echo "Restart: pm2 restart latelounge-cafe"