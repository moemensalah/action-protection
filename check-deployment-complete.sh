#!/bin/bash

# Complete deployment verification script
echo "🔍 Checking Action Protection Deployment Status"
echo "==============================================="

# Configuration
PROJECT_NAME="actionprotection"
APP_USER="appuser"
APP_PORT="3000"
DATABASE_PORT="5432"
DB_NAME="actionprotection_db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

echo "Configuration:"
echo "  Project: $PROJECT_NAME"
echo "  User: $APP_USER"
echo "  App Port: $APP_PORT"
echo "  DB Port: $DATABASE_PORT"
echo ""

# 1. Check if deployment user exists
echo "1. Checking deployment user..."
if id "$APP_USER" &>/dev/null; then
    success "User '$APP_USER' exists"
    echo "   Home: $(eval echo ~$APP_USER)"
else
    error "User '$APP_USER' does not exist"
    echo "   Fix: sudo useradd -m -s /bin/bash $APP_USER"
fi
echo ""

# 2. Check project directory structure
echo "2. Checking project directory..."
PROJECT_DIR="/home/$APP_USER/$PROJECT_NAME"
if [ -d "$PROJECT_DIR" ]; then
    success "Project directory exists: $PROJECT_DIR"
    
    # Check key files
    if [ -f "$PROJECT_DIR/package.json" ]; then
        success "package.json found"
    else
        error "package.json missing"
    fi
    
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        success "node_modules directory exists"
    else
        error "node_modules missing - run: cd $PROJECT_DIR && npm install"
    fi
    
    if [ -f "$PROJECT_DIR/.env" ]; then
        success ".env file exists"
    else
        error ".env file missing"
    fi
    
    if [ -d "$PROJECT_DIR/dist" ]; then
        success "Build directory exists"
    else
        error "Build directory missing - run: cd $PROJECT_DIR && npm run build"
    fi
    
    if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
        success "PM2 config file exists"
    else
        error "PM2 config file missing"
    fi
    
else
    error "Project directory does not exist: $PROJECT_DIR"
    echo "   This means deployment never started or failed early"
fi
echo ""

# 3. Check system dependencies
echo "3. Checking system dependencies..."

# Node.js
if command -v node &> /dev/null; then
    success "Node.js installed: $(node --version)"
else
    error "Node.js not installed"
fi

# npm
if command -v npm &> /dev/null; then
    success "npm installed: $(npm --version)"
else
    error "npm not installed"
fi

# PM2
if command -v pm2 &> /dev/null; then
    success "PM2 installed: $(pm2 --version)"
else
    error "PM2 not installed"
    echo "   Fix: sudo npm install -g pm2"
fi

# PostgreSQL
if command -v psql &> /dev/null; then
    success "PostgreSQL client installed"
else
    error "PostgreSQL client not installed"
fi
echo ""

# 4. Check PostgreSQL service and database
echo "4. Checking PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    success "PostgreSQL service running"
    
    # Check database
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        success "Database '$DB_NAME' exists"
        
        # Test connection
        if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
            success "Database connection successful"
        else
            error "Cannot connect to database"
        fi
    else
        error "Database '$DB_NAME' does not exist"
        echo "   Fix: sudo -u postgres createdb $DB_NAME"
    fi
else
    error "PostgreSQL service not running"
    echo "   Fix: sudo systemctl start postgresql && sudo systemctl enable postgresql"
fi
echo ""

# 5. Check PM2 processes
echo "5. Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    PM2_LIST=$(pm2 list)
    if echo "$PM2_LIST" | grep -q "$PROJECT_NAME"; then
        success "PM2 process '$PROJECT_NAME' exists"
        
        # Check if it's running
        if pm2 describe "$PROJECT_NAME" | grep -q "online"; then
            success "Application is ONLINE"
        else
            error "Application is NOT online"
            echo "   Fix: pm2 restart $PROJECT_NAME"
        fi
    else
        error "PM2 process '$PROJECT_NAME' does not exist"
        echo "   Fix: cd $PROJECT_DIR && pm2 start ecosystem.config.js"
    fi
    
    echo "   Current PM2 processes:"
    pm2 list
else
    error "PM2 not available"
fi
echo ""

# 6. Check ports and connectivity
echo "6. Checking ports and connectivity..."

# Check if port is in use
if command -v ss &> /dev/null; then
    if ss -tlnp | grep -q ":$APP_PORT"; then
        success "Port $APP_PORT is in use"
        echo "   Process using port $APP_PORT:"
        ss -tlnp | grep ":$APP_PORT"
    else
        error "Port $APP_PORT is not in use"
        echo "   Application is not running"
    fi
else
    warning "ss command not available, using alternative check"
    if netstat -tlnp 2>/dev/null | grep -q ":$APP_PORT"; then
        success "Port $APP_PORT is in use"
    else
        error "Port $APP_PORT is not in use"
    fi
fi

# Test HTTP connectivity
if curl -f "http://localhost:$APP_PORT/api/health" &>/dev/null; then
    success "Application responding to HTTP requests"
else
    error "Application not responding to HTTP requests"
    echo "   Try: curl http://localhost:$APP_PORT"
fi
echo ""

# 7. Check web server (Nginx)
echo "7. Checking web server..."
if command -v nginx &> /dev/null; then
    success "Nginx installed"
    
    if systemctl is-active --quiet nginx; then
        success "Nginx service running"
        
        # Check configuration
        if [ -f "/etc/nginx/sites-available/$PROJECT_NAME" ]; then
            success "Nginx configuration exists"
            
            if nginx -t &>/dev/null; then
                success "Nginx configuration valid"
            else
                error "Nginx configuration has errors"
                echo "   Fix: sudo nginx -t"
            fi
        else
            warning "Nginx configuration not found"
        fi
    else
        error "Nginx service not running"
        echo "   Fix: sudo systemctl start nginx"
    fi
else
    warning "Nginx not installed (optional)"
fi
echo ""

# 8. Check recent logs
echo "8. Checking recent logs..."
if [ -d "$PROJECT_DIR/logs" ]; then
    success "Log directory exists"
    
    if [ -f "$PROJECT_DIR/logs/error.log" ]; then
        echo "   Recent errors:"
        tail -5 "$PROJECT_DIR/logs/error.log" 2>/dev/null || echo "   No recent errors"
    fi
else
    warning "Log directory not found"
fi

# PM2 logs
if command -v pm2 &> /dev/null; then
    echo "   Recent PM2 logs:"
    pm2 logs "$PROJECT_NAME" --lines 5 2>/dev/null || echo "   No PM2 logs available"
fi
echo ""

# 9. Overall deployment status
echo "9. Overall Deployment Status:"
echo "=============================="

# Simple checks
USER_OK=$(id "$APP_USER" &>/dev/null && echo "1" || echo "0")
DIR_OK=$([ -d "$PROJECT_DIR" ] && echo "1" || echo "0")
PM2_OK=$(command -v pm2 &>/dev/null && echo "1" || echo "0")
POSTGRES_OK=$(systemctl is-active --quiet postgresql && echo "1" || echo "0")
APP_RUNNING=$(ss -tlnp 2>/dev/null | grep -q ":$APP_PORT" && echo "1" || echo "0")

TOTAL_SCORE=$((USER_OK + DIR_OK + PM2_OK + POSTGRES_OK + APP_RUNNING))

if [ $TOTAL_SCORE -eq 5 ]; then
    success "DEPLOYMENT COMPLETE - Application should be running"
    echo "   Access: http://localhost:$APP_PORT"
elif [ $TOTAL_SCORE -ge 3 ]; then
    warning "DEPLOYMENT PARTIAL - Some issues need fixing"
    echo "   Score: $TOTAL_SCORE/5"
else
    error "DEPLOYMENT FAILED - Major issues detected"
    echo "   Score: $TOTAL_SCORE/5"
fi

echo ""
echo "10. Quick Fix Commands:"
echo "======================"
echo "Start all services:"
echo "  sudo systemctl start postgresql nginx"
echo ""
echo "Install missing components:"
echo "  sudo npm install -g pm2"
echo ""
echo "Start application manually:"
echo "  cd $PROJECT_DIR"
echo "  npm install"
echo "  npm run build"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "Check application status:"
echo "  pm2 list"
echo "  pm2 logs $PROJECT_NAME"
echo "  curl http://localhost:$APP_PORT"