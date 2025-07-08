#!/bin/bash

# Quick deployment failure diagnosis commands
echo "🔍 Checking deployment failure..."
echo "================================="

# 1. Check if PM2 is installed
echo "1. Checking PM2 installation:"
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 is installed"
    pm2 list
else
    echo "❌ PM2 is not installed"
    echo "   Install with: sudo npm install -g pm2"
fi
echo ""

# 2. Check if the project directory exists
echo "2. Checking project directory:"
if [ -d "/home/appuser/actionprotection" ]; then
    echo "✅ Project directory exists"
    ls -la /home/appuser/actionprotection/
else
    echo "❌ Project directory does not exist"
    echo "   The deployment script may have failed"
fi
echo ""

# 3. Check if the user exists
echo "3. Checking user account:"
if id "appuser" &>/dev/null; then
    echo "✅ User 'appuser' exists"
else
    echo "❌ User 'appuser' does not exist"
    echo "   Create with: sudo useradd -m -s /bin/bash appuser"
fi
echo ""

# 4. Check PostgreSQL
echo "4. Checking PostgreSQL:"
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "actionprotection_db"; then
        echo "✅ Database 'actionprotection_db' exists"
    else
        echo "❌ Database 'actionprotection_db' does not exist"
        echo "   Create with: sudo -u postgres createdb actionprotection_db"
    fi
else
    echo "❌ PostgreSQL is not running"
    echo "   Start with: sudo systemctl start postgresql"
fi
echo ""

# 5. Check Node.js and npm
echo "5. Checking Node.js and npm:"
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not installed"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not installed"
fi
echo ""

# 6. Check what's running on port 3000
echo "6. Checking port 3000:"
if ss -tlnp | grep -q ":3000"; then
    echo "✅ Something is running on port 3000:"
    ss -tlnp | grep ":3000"
else
    echo "❌ Nothing running on port 3000"
fi
echo ""

# 7. Check recent logs
echo "7. Checking recent system logs:"
echo "Recent journal entries:"
sudo journalctl --since "30 minutes ago" -n 20 --no-pager | tail -10
echo ""

echo "🔧 Next steps to fix deployment:"
echo "================================"
echo "1. If PM2 is missing: sudo npm install -g pm2"
echo "2. If project directory is missing: run the deployment script again"
echo "3. If PostgreSQL is not running: sudo systemctl start postgresql"
echo "4. If database is missing: sudo -u postgres createdb actionprotection_db"
echo "5. Manual project start: cd /home/appuser/actionprotection && npm install && npm run build && pm2 start ecosystem.config.js"