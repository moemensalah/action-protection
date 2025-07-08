#!/bin/bash

# ========================================================================
# DEPLOYMENT STATUS CHECK SCRIPT
# ========================================================================
# This script helps diagnose deployment issues and check project status
# Use this to troubleshoot failed deployments
# ========================================================================

echo "🔍 Action Protection - Deployment Status Check"
echo "=============================================="

# Configuration (update these to match your deployment)
PROJECT_NAME="actionprotection"
APP_USER="appuser"
APP_PORT="3000"
DATABASE_PORT="5432"
DB_NAME="actionprotection_db"

echo "📋 Checking deployment status for:"
echo "   Project: ${PROJECT_NAME}"
echo "   User: ${APP_USER}"
echo "   App Port: ${APP_PORT}"
echo "   DB Port: ${DATABASE_PORT}"
echo ""

# 1. Check if user exists
echo "👤 Checking user account..."
if id "$APP_USER" &>/dev/null; then
    echo "✅ User $APP_USER exists"
    echo "   Home directory: $(eval echo ~$APP_USER)"
else
    echo "❌ User $APP_USER does not exist"
    echo "   Run: sudo useradd -m -s /bin/bash $APP_USER"
fi
echo ""

# 2. Check project directory
echo "📁 Checking project directory..."
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"
if [ -d "$PROJECT_DIR" ]; then
    echo "✅ Project directory exists: $PROJECT_DIR"
    echo "   Contents:"
    ls -la "$PROJECT_DIR" 2>/dev/null || echo "   Cannot access directory"
else
    echo "❌ Project directory does not exist: $PROJECT_DIR"
    echo "   Run: sudo mkdir -p $PROJECT_DIR && sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR"
fi
echo ""

# 3. Check Node.js installation
echo "🟢 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js installed: $(node --version)"
else
    echo "❌ Node.js not installed"
    echo "   Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "        sudo apt-get install -y nodejs"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm installed: $(npm --version)"
else
    echo "❌ npm not installed"
fi
echo ""

# 4. Check PM2 installation
echo "⚙️ Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 installed: $(pm2 --version)"
    echo "   PM2 status:"
    pm2 list
else
    echo "❌ PM2 not installed"
    echo "   Run: sudo npm install -g pm2"
fi
echo ""

# 5. Check PostgreSQL
echo "🗄️ Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client installed"
    
    # Check if PostgreSQL service is running
    if systemctl is-active --quiet postgresql; then
        echo "✅ PostgreSQL service is running"
        
        # Check if database exists
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            echo "✅ Database $DB_NAME exists"
        else
            echo "❌ Database $DB_NAME does not exist"
            echo "   Run: sudo -u postgres createdb $DB_NAME"
        fi
        
        # Check database connection
        if sudo -u postgres psql -d $DB_NAME -c "SELECT 1;" &>/dev/null; then
            echo "✅ Database connection successful"
        else
            echo "❌ Cannot connect to database"
        fi
    else
        echo "❌ PostgreSQL service not running"
        echo "   Run: sudo systemctl start postgresql"
        echo "        sudo systemctl enable postgresql"
    fi
else
    echo "❌ PostgreSQL not installed"
    echo "   Run: sudo apt update && sudo apt install -y postgresql postgresql-contrib"
fi
echo ""

# 6. Check ports
echo "🔌 Checking ports..."
if command -v ss &> /dev/null; then
    echo "Port $APP_PORT status:"
    ss -tlnp | grep ":$APP_PORT " || echo "   Port $APP_PORT is free"
    
    echo "Port $DATABASE_PORT status:"
    ss -tlnp | grep ":$DATABASE_PORT " || echo "   Port $DATABASE_PORT is free"
else
    echo "⚠️ ss command not available, checking with alternative method"
    if [ -f /proc/net/tcp ]; then
        APP_PORT_HEX=$(printf "%04X" $APP_PORT)
        if grep -q ":$APP_PORT_HEX " /proc/net/tcp; then
            echo "❌ Port $APP_PORT is in use"
        else
            echo "✅ Port $APP_PORT is free"
        fi
    fi
fi
echo ""

# 7. Check Nginx
echo "🌐 Checking Nginx..."
if command -v nginx &> /dev/null; then
    echo "✅ Nginx installed: $(nginx -v 2>&1)"
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx service is running"
    else
        echo "❌ Nginx service not running"
        echo "   Run: sudo systemctl start nginx"
    fi
    
    # Check Nginx configuration
    if [ -f "/etc/nginx/sites-available/$PROJECT_NAME" ]; then
        echo "✅ Nginx configuration exists"
        if nginx -t &>/dev/null; then
            echo "✅ Nginx configuration is valid"
        else
            echo "❌ Nginx configuration has errors"
            echo "   Run: sudo nginx -t"
        fi
    else
        echo "❌ Nginx configuration not found"
    fi
else
    echo "❌ Nginx not installed"
    echo "   Run: sudo apt install -y nginx"
fi
echo ""

# 8. Check project files
echo "📋 Checking project files..."
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR" 2>/dev/null || echo "Cannot access $PROJECT_DIR"
    
    if [ -f "package.json" ]; then
        echo "✅ package.json exists"
    else
        echo "❌ package.json missing"
    fi
    
    if [ -d "node_modules" ]; then
        echo "✅ node_modules exists"
    else
        echo "❌ node_modules missing"
        echo "   Run: cd $PROJECT_DIR && npm install"
    fi
    
    if [ -f "dist/server/index.js" ]; then
        echo "✅ Built server files exist"
    else
        echo "❌ Built server files missing"
        echo "   Run: cd $PROJECT_DIR && npm run build"
    fi
    
    if [ -f ".env" ]; then
        echo "✅ .env file exists"
    else
        echo "❌ .env file missing"
    fi
else
    echo "❌ Cannot check project files - directory not accessible"
fi
echo ""

# 9. Check logs
echo "📋 Checking recent logs..."
if [ -d "$PROJECT_DIR/logs" ]; then
    echo "Application logs:"
    ls -la "$PROJECT_DIR/logs/" 2>/dev/null || echo "   No log files found"
    
    if [ -f "$PROJECT_DIR/logs/error.log" ]; then
        echo "   Recent errors:"
        tail -10 "$PROJECT_DIR/logs/error.log" 2>/dev/null || echo "   Cannot read error log"
    fi
else
    echo "❌ Logs directory not found"
fi

# PM2 logs
if command -v pm2 &> /dev/null; then
    echo "PM2 logs:"
    pm2 logs $PROJECT_NAME --lines 10 2>/dev/null || echo "   No PM2 logs for $PROJECT_NAME"
fi

# System logs
echo "System logs (last 10 lines):"
sudo journalctl -u nginx -n 10 --no-pager 2>/dev/null || echo "   Cannot read nginx logs"
echo ""

# 10. Quick fixes
echo "🔧 Quick Fix Commands:"
echo "====================="
echo "Kill all node processes:"
echo "  sudo pkill -f node"
echo ""
echo "Restart services:"
echo "  sudo systemctl restart postgresql"
echo "  sudo systemctl restart nginx"
echo ""
echo "Fix permissions:"
echo "  sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR"
echo "  sudo chmod -R 755 $PROJECT_DIR"
echo ""
echo "Reinstall dependencies:"
echo "  cd $PROJECT_DIR && npm install"
echo ""
echo "Rebuild project:"
echo "  cd $PROJECT_DIR && npm run build"
echo ""
echo "Check PM2 processes:"
echo "  pm2 list"
echo "  pm2 logs $PROJECT_NAME"
echo "  pm2 restart $PROJECT_NAME"
echo ""

echo "✅ Status check complete!"
echo "Use the commands above to fix any issues found."