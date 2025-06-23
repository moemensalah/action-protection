#!/bin/bash

echo "Fixing database from correct directory..."

# Change to the correct application directory
cd /home/appuser/latelounge

# Stop PM2 processes that are running from wrong directory
pm2 stop all
pm2 delete all

# Set the database URL environment variable
export DATABASE_URL="postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db"

# Test database connection first
echo "Testing database connection..."
psql $DATABASE_URL -c "SELECT current_user, current_database();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
    
    # Run database migrations from correct directory
    echo "Running database migrations..."
    npm run db:push
    
    # Create ecosystem config with proper paths
    echo "Creating PM2 ecosystem config..."
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/appuser/latelounge',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db',
      SESSION_SECRET: '88HX0HZPT223ZNGGV1QJO4IA3GX5H48B',
      REPL_ID: 'krw1cv',
      ISSUER_URL: 'https://replit.com/oidc',
      REPLIT_DOMAINS: 'demo2.late-lounge.com'
    },
    error_file: '/home/appuser/latelounge/logs/err.log',
    out_file: '/home/appuser/latelounge/logs/out.log',
    log_file: '/home/appuser/latelounge/logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF
    
    # Ensure logs directory exists
    mkdir -p logs
    
    # Start PM2 from correct directory
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    
    # Test the API
    echo "Testing API in 5 seconds..."
    sleep 5
    curl -s http://localhost:3000/api/categories
    
else
    echo "✗ Database connection failed"
    echo "Please check database credentials and try again"
fi

echo "Fix complete!"