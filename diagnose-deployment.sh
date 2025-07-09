#!/bin/bash

# ========================================================================
# Diagnose Deployment Issues - Action Protection
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Diagnosing Action Protection deployment issues..."
echo "================================================="

# Check if project directory exists
echo "1. Checking project directory..."
if [ -d "$PROJECT_DIR" ]; then
    echo "✅ Project directory exists: $PROJECT_DIR"
    cd $PROJECT_DIR
    
    # Check project structure
    echo "📁 Project structure:"
    ls -la | head -10
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        echo "✅ package.json exists"
    else
        echo "❌ package.json missing"
    fi
    
    # Check if dist directory exists
    if [ -d "dist" ]; then
        echo "✅ dist directory exists"
        echo "📦 Build outputs:"
        ls -la dist/
        
        if [ -f "dist/index.js" ]; then
            echo "✅ Server build exists ($(du -h dist/index.js | cut -f1))"
        else
            echo "❌ Server build missing (dist/index.js)"
        fi
        
        if [ -f "dist/public/index.html" ]; then
            echo "✅ Client build exists"
        else
            echo "❌ Client build missing (dist/public/index.html)"
        fi
    else
        echo "❌ dist directory missing - build not completed"
    fi
    
else
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "   Run complete-production-deployment.sh first"
    exit 1
fi

echo ""
echo "2. Checking PM2 status..."
sudo -u $APP_USER pm2 list || echo "❌ PM2 not accessible"

echo ""
echo "3. Checking database connection..."
if psql "postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "4. Checking services..."
echo "🔧 Nginx status:"
sudo systemctl is-active nginx || echo "❌ Nginx not running"

echo "🔧 PostgreSQL status:"
sudo systemctl is-active postgresql || echo "❌ PostgreSQL not running"

echo ""
echo "5. Checking ports..."
if netstat -tlnp | grep -q ":4000"; then
    echo "✅ Port 4000 is in use"
    netstat -tlnp | grep ":4000"
else
    echo "❌ Port 4000 not in use"
fi

echo ""
echo "6. Checking application logs..."
echo "📋 PM2 logs (last 10 lines):"
sudo -u $APP_USER pm2 logs action-protection --lines 10 2>/dev/null || echo "❌ No PM2 logs available"

echo ""
echo "=================================================================="
echo "🎯 RECOMMENDED ACTIONS:"
echo "=================================================================="

if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
    echo "❗ Build issue detected - run: ./quick-fix-current-deployment.sh"
fi

if ! sudo -u $APP_USER pm2 list | grep -q "action-protection.*online"; then
    echo "❗ PM2 process not running - check build first, then restart"
fi

if ! sudo systemctl is-active nginx > /dev/null; then
    echo "❗ Nginx not running - run: sudo systemctl start nginx"
fi

if ! sudo systemctl is-active postgresql > /dev/null; then
    echo "❗ PostgreSQL not running - run: sudo systemctl start postgresql"
fi

echo ""
echo "🔧 Quick fixes:"
echo "   - Build issue: ./quick-fix-current-deployment.sh"
echo "   - Full redeploy: ./complete-production-deployment.sh"
echo "   - Clean slate: ./clean-deployment.sh then redeploy"