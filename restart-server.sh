#!/bin/bash

echo "=== RESTARTING SERVER ==="

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all
pm2 delete all

# Navigate to app directory
cd /home/appuser/latelounge

# Check if ecosystem file exists
if [ ! -f "ecosystem.config.cjs" ]; then
    echo "Creating ecosystem.config.cjs..."
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
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
fi

# Create logs directory
mkdir -p logs

# Start PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

# Check status
echo "PM2 Status:"
pm2 status

# Test connection
echo "Testing connection in 5 seconds..."
sleep 5
curl -I http://localhost:3000

echo "=== RESTART COMPLETE ==="