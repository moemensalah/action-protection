#!/bin/bash

# ========================================================================
# Diagnose PM2 Issue - Action Protection
# ========================================================================

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Diagnosing PM2 application issue..."

cd $PROJECT_DIR

echo "1. Checking PM2 status..."
sudo -u $APP_USER pm2 list

echo "2. Checking PM2 logs..."
echo "📋 Error logs:"
sudo -u $APP_USER pm2 logs action-protection --err --lines 20 --nostream

echo "📋 Output logs:"
sudo -u $APP_USER pm2 logs action-protection --out --lines 20 --nostream

echo "3. Checking if vite build created client files..."
if [ -d "dist/public" ]; then
    echo "✅ Client build directory exists"
    ls -la dist/public/
else
    echo "❌ Client build directory missing - vite build failed"
    echo "📁 Current dist contents:"
    ls -la dist/
fi

echo "4. Testing server bundle directly..."
cd dist
echo "🔧 Testing server.js import..."
sudo -u $APP_USER node -e "
import('./server.js').then(() => {
    console.log('✅ Server bundle loaded successfully');
    process.exit(0);
}).catch(err => {
    console.error('❌ Server bundle error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});
" 2>&1 | head -20

cd ..

echo "5. Checking database connection..."
echo "🔧 Testing database connection..."
sudo -u $APP_USER psql 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db' -c "SELECT 1;" 2>&1 | head -5

echo "6. Checking port 4000 availability..."
netstat -tlpn | grep :4000 || echo "Port 4000 not listening"

echo "7. Checking process details..."
sudo -u $APP_USER pm2 show action-protection

echo ""
echo "🎯 Diagnosis Summary:"
echo "==================="
echo "PM2 Status: $(sudo -u $APP_USER pm2 list | grep action-protection | awk '{print $10}' || echo 'Not found')"
echo "Port 4000: $(netstat -tlpn | grep :4000 | awk '{print "Listening"}' || echo 'Not listening')"
echo "Client Build: $([ -d 'dist/public' ] && echo 'Present' || echo 'Missing')"
echo "Server Bundle: $([ -f 'dist/server.js' ] && echo "Present ($(du -h dist/server.js | cut -f1))" || echo 'Missing')"
echo ""
echo "🔧 Next Steps:"
echo "- If client build missing: Run vite build manually"
echo "- If server errors: Check PM2 logs for specific error"
echo "- If database issues: Check database connection"
echo "- If port issues: Check if another process is using port 4000"