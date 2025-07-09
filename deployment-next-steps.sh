#!/bin/bash

# Next steps for Action Protection deployment
echo "🔧 Action Protection Deployment - Next Steps"
echo "==========================================="

# Check current deployment status
echo "1. Checking deployment progress..."
cd /home/actionprotection/action-protection

# Check if source files were copied
if [ -f "package.json" ]; then
    echo "✅ Source files present"
else
    echo "❌ Source files missing"
    exit 1
fi

# Install dependencies
echo "2. Installing dependencies..."
npm install

# Build the project
echo "3. Building project..."
npm run build

# Verify build output
if [ -f "dist/server/index.js" ]; then
    echo "✅ Build successful - server file exists"
else
    echo "❌ Build failed - checking build output"
    ls -la dist/ 2>/dev/null || echo "No dist directory"
    exit 1
fi

# Check PostgreSQL connection with actual port
echo "4. Checking database connection..."
if sudo -u postgres psql -p 5432 -d actionprotection_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Database connection successful (port 5432)"
    DB_PORT=5432
else
    echo "❌ Database connection failed"
    exit 1
fi

# Update environment variables
echo "5. Setting up environment..."
cat > .env << ENV_EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://appuser:SECURE_PASSWORD_HERE@localhost:5432/actionprotection_db
REPLIT_DOMAINS=demox.actionprotectionkw.com,www.demox.actionprotectionkw.com,localhost:4000,127.0.0.1:4000
REPL_ID=krw1cv
SESSION_SECRET=actionprotection-production-session-secret-$(date +%s)
ISSUER_URL=https://replit.com/oidc
ENV_EOF

# Create logs directory
mkdir -p logs

# Create correct ecosystem.config.js
echo "6. Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'action-protection',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://appuser:SECURE_PASSWORD_HERE@localhost:5432/actionprotection_db'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF

# Set proper ownership
chown -R actionprotection:actionprotection /home/actionprotection/action-protection

# Start with PM2
echo "7. Starting application with PM2..."
sudo -u actionprotection pm2 start ecosystem.config.js --env production

# Check PM2 status
echo "8. Checking PM2 status..."
sudo -u actionprotection pm2 list

# Test application
echo "9. Testing application..."
sleep 5
if curl -f -s "http://localhost:4000" > /dev/null; then
    echo "✅ Application responding on port 4000"
else
    echo "❌ Application not responding - checking logs"
    sudo -u actionprotection pm2 logs action-protection --lines 10
fi

echo ""
echo "✅ Deployment next steps completed!"
echo "   Access: http://localhost:4000"
echo "   Logs: sudo -u actionprotection pm2 logs action-protection"
echo "   Status: sudo -u actionprotection pm2 list"