#!/bin/bash

cd /home/appuser/latelounge

# Stop PM2
pm2 stop all
pm2 delete all

# Create ecosystem config with explicit environment variables
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
      PORT: 3000,
      DATABASE_URL: 'postgresql://latelounge_user:secure_password123@localhost:5432/latelounge_db',
      SESSION_SECRET: 'your_session_secret_key_here_change_in_production',
      REPL_ID: 'latelounge',
      ISSUER_URL: 'https://replit.com/oidc',
      REPLIT_DOMAINS: 'yourdomain.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# Start PM2
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "Environment variables now set directly in PM2 config"
pm2 logs --lines 5