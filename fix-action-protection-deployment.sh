#!/bin/bash

# Fix Action Protection Deployment Issues
echo "🔧 Fixing Action Protection Deployment Issues"
echo "============================================="

cd /home/actionprotection/action-protection

# Fix 1: Create missing index.html in root directory for Vite build
echo "1. Fixing Vite build issue..."
if [ ! -f "index.html" ]; then
    echo "Creating index.html entry point..."
    cp client/index.html ./index.html
    echo "✅ index.html copied to root directory"
else
    echo "✅ index.html already exists"
fi

# Fix 2: Fix drizzle configuration
echo "2. Fixing Drizzle configuration..."
if [ ! -f "drizzle.config.json" ]; then
    echo "Creating drizzle.config.json from drizzle.config.ts..."
    cat > drizzle.config.json << 'EOF'
{
  "out": "./migrations",
  "schema": "./shared/schema.ts",
  "dialect": "postgresql",
  "dbCredentials": {
    "url": "$DATABASE_URL"
  }
}
EOF
    echo "✅ drizzle.config.json created"
else
    echo "✅ drizzle.config.json already exists"
fi

# Fix 3: Set proper environment variables
echo "3. Setting environment variables..."
export NODE_ENV=production
export DATABASE_URL="postgresql://appuser:SECURE_PASSWORD_HERE@localhost:5432/actionprotection_db"
export PORT=4000

# Fix 4: Install dependencies if needed
echo "4. Installing dependencies..."
npm install

# Fix 5: Try building again
echo "5. Running production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed, checking for missing files..."
    
    # Check if client/index.html exists
    if [ -f "client/index.html" ]; then
        echo "Found client/index.html, ensuring proper structure..."
        
        # Ensure proper Vite configuration
        echo "Checking Vite configuration..."
        if grep -q "root.*client" vite.config.ts; then
            echo "✅ Vite root configured correctly"
        else
            echo "❌ Vite configuration issue detected"
        fi
        
        # Try alternative build approach
        echo "Trying alternative build approach..."
        cd client
        npm run build
        cd ..
        
        if [ -d "client/dist" ]; then
            echo "Moving client/dist to dist/public..."
            mkdir -p dist
            cp -r client/dist dist/public
            echo "✅ Build completed with workaround"
        fi
    else
        echo "❌ client/index.html not found"
        exit 1
    fi
fi

# Fix 6: Run database migrations
echo "6. Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations successful!"
else
    echo "❌ Database migrations failed, trying alternative approach..."
    
    # Try with explicit config file
    npx drizzle-kit push --config=drizzle.config.ts
    
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations successful with TypeScript config!"
    else
        echo "❌ Database migrations still failing"
        echo "Checking database connection..."
        
        # Test database connection
        if sudo -u postgres psql -d actionprotection_db -c "SELECT 1;" &>/dev/null; then
            echo "✅ Database connection OK"
            echo "Issue might be with schema files"
        else
            echo "❌ Database connection failed"
            exit 1
        fi
    fi
fi

# Fix 7: Ensure proper file permissions
echo "7. Setting file permissions..."
chown -R actionprotection:actionprotection /home/actionprotection/action-protection
chmod +x /home/actionprotection/action-protection/dist/server/index.js 2>/dev/null || true

# Fix 8: Create PM2 configuration
echo "8. Creating PM2 configuration..."
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

# Fix 9: Create logs directory
mkdir -p logs

# Fix 10: Start the application
echo "9. Starting application..."
sudo -u actionprotection pm2 delete action-protection 2>/dev/null || true
sudo -u actionprotection pm2 start ecosystem.config.js --env production

# Fix 11: Check application status
echo "10. Checking application status..."
sleep 5
sudo -u actionprotection pm2 list

# Test application
if curl -f -s "http://localhost:4000" > /dev/null; then
    echo "✅ Application is running successfully!"
    echo "   Access: http://localhost:4000"
else
    echo "❌ Application not responding"
    echo "Checking logs..."
    sudo -u actionprotection pm2 logs action-protection --lines 10
fi

echo ""
echo "🎉 Deployment fixes completed!"
echo "   Application: http://localhost:4000"
echo "   Logs: sudo -u actionprotection pm2 logs action-protection"
echo "   Status: sudo -u actionprotection pm2 list"