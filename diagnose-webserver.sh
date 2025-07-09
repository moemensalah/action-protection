#!/bin/bash

# Action Protection Webserver Diagnostic Script
# This script diagnoses why the webserver appears to be down

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

# Configuration
PROJECT_NAME="action-protection"
APP_USER="actionprotection"
APP_PORT="4000"
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"
DOMAIN="demox.actionprotectionkw.com"

print_section "WEBSERVER DIAGNOSTIC REPORT"
echo "Project: ${PROJECT_NAME}"
echo "Port: ${APP_PORT}"
echo "Domain: ${DOMAIN}"
echo "Directory: ${PROJECT_DIR}"
echo "Timestamp: $(date)"

print_section "1. SYSTEM STATUS CHECK"

# Check if user exists
if id -u ${APP_USER} > /dev/null 2>&1; then
    print_status "User ${APP_USER} exists"
else
    print_error "User ${APP_USER} does not exist"
fi

# Check if project directory exists
if [ -d "${PROJECT_DIR}" ]; then
    print_status "Project directory exists: ${PROJECT_DIR}"
    echo "Directory size: $(du -sh ${PROJECT_DIR} | cut -f1)"
    echo "Directory permissions: $(ls -ld ${PROJECT_DIR})"
else
    print_error "Project directory does not exist: ${PROJECT_DIR}"
fi

# Check disk space
print_info "Disk usage:"
df -h

# Check memory usage
print_info "Memory usage:"
free -h

print_section "2. NETWORK & PORT CHECK"

# Check if port is in use
print_info "Checking port ${APP_PORT}:"
if netstat -tuln | grep ":${APP_PORT}"; then
    print_status "Port ${APP_PORT} is in use"
    echo "Process using port ${APP_PORT}:"
    lsof -i:${APP_PORT} || print_warning "lsof not available"
else
    print_error "Port ${APP_PORT} is not in use"
fi

# Check all listening ports
print_info "All listening ports:"
netstat -tuln | grep LISTEN

print_section "3. PM2 STATUS CHECK"

# Check if PM2 is installed globally
if command -v pm2 &> /dev/null; then
    print_status "PM2 is installed globally"
    echo "PM2 version: $(pm2 --version)"
else
    print_error "PM2 is not installed globally"
fi

# Check PM2 processes as app user
print_info "PM2 processes for user ${APP_USER}:"
if sudo -u ${APP_USER} pm2 list 2>/dev/null; then
    print_status "PM2 processes listed successfully"
else
    print_error "Failed to list PM2 processes"
fi

# Check PM2 status
print_info "PM2 status details:"
sudo -u ${APP_USER} pm2 status 2>/dev/null || print_error "PM2 status failed"

# Check PM2 logs
print_info "Recent PM2 logs:"
sudo -u ${APP_USER} pm2 logs --lines 20 2>/dev/null || print_error "PM2 logs failed"

print_section "4. NGINX STATUS CHECK"

# Check if nginx is installed
if command -v nginx &> /dev/null; then
    print_status "nginx is installed"
    echo "nginx version: $(nginx -v 2>&1)"
else
    print_error "nginx is not installed"
fi

# Check nginx service status
print_info "nginx service status:"
if systemctl is-active --quiet nginx; then
    print_status "nginx service is active"
else
    print_error "nginx service is not active"
fi

systemctl status nginx --no-pager || print_error "nginx service status failed"

# Check nginx configuration
print_info "nginx configuration test:"
if nginx -t 2>&1; then
    print_status "nginx configuration is valid"
else
    print_error "nginx configuration is invalid"
fi

# Check nginx sites
print_info "nginx sites configuration:"
if [ -f "/etc/nginx/sites-available/${PROJECT_NAME}" ]; then
    print_status "nginx site configuration exists"
    echo "Site config size: $(ls -lh /etc/nginx/sites-available/${PROJECT_NAME} | awk '{print $5}')"
else
    print_error "nginx site configuration missing"
fi

if [ -L "/etc/nginx/sites-enabled/${PROJECT_NAME}" ]; then
    print_status "nginx site is enabled"
else
    print_error "nginx site is not enabled"
fi

print_section "5. APPLICATION STATUS CHECK"

# Check if application files exist
print_info "Application files check:"
cd ${PROJECT_DIR} 2>/dev/null || { print_error "Cannot access project directory"; exit 1; }

CRITICAL_FILES=("package.json" "server" "client" "shared")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file missing"
    fi
done

# Check node_modules
if [ -d "node_modules" ]; then
    print_status "node_modules exists"
    echo "node_modules size: $(du -sh node_modules | cut -f1)"
else
    print_error "node_modules missing"
fi

# Check build output
if [ -d "dist" ]; then
    print_status "dist directory exists"
    echo "dist size: $(du -sh dist | cut -f1)"
    if [ -f "dist/index.js" ]; then
        print_status "dist/index.js exists"
    else
        print_error "dist/index.js missing"
    fi
else
    print_warning "dist directory missing (development mode?)"
fi

# Check PM2 ecosystem config
if [ -f "ecosystem.config.cjs" ]; then
    print_status "ecosystem.config.cjs exists"
    echo "PM2 config:"
    head -20 ecosystem.config.cjs
else
    print_error "ecosystem.config.cjs missing"
fi

print_section "6. CONNECTIVITY TESTS"

# Test localhost connectivity
print_info "Testing localhost connectivity:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT} 2>/dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${APP_PORT} 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        print_status "Application responds on localhost:${APP_PORT} (HTTP $HTTP_CODE)"
    else
        print_warning "Application responds on localhost:${APP_PORT} but returns HTTP $HTTP_CODE"
    fi
else
    print_error "Application does not respond on localhost:${APP_PORT}"
fi

# Test API endpoint
print_info "Testing API endpoint:"
if curl -s http://localhost:${APP_PORT}/api/contact >/dev/null 2>&1; then
    print_status "API endpoint /api/contact is accessible"
else
    print_error "API endpoint /api/contact is not accessible"
fi

# Test nginx proxy
print_info "Testing nginx proxy:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        print_status "nginx proxy responds (HTTP $HTTP_CODE)"
    else
        print_warning "nginx proxy responds but returns HTTP $HTTP_CODE"
    fi
else
    print_error "nginx proxy does not respond"
fi

print_section "7. LOG ANALYSIS"

# Check system logs
print_info "Recent system logs related to nginx:"
journalctl -u nginx --no-pager -n 20 2>/dev/null || print_error "Cannot access nginx logs"

# Check application logs
print_info "Application log files:"
if [ -d "logs" ]; then
    ls -la logs/
    if [ -f "logs/out.log" ]; then
        print_info "Recent application output logs:"
        tail -20 logs/out.log
    fi
    if [ -f "logs/err.log" ]; then
        print_info "Recent application error logs:"
        tail -20 logs/err.log
    fi
else
    print_warning "logs directory not found"
fi

print_section "8. PROCESS INFORMATION"

# Check running processes
print_info "Node.js processes:"
ps aux | grep node | grep -v grep || print_warning "No Node.js processes found"

print_info "nginx processes:"
ps aux | grep nginx | grep -v grep || print_warning "No nginx processes found"

print_info "PM2 processes:"
ps aux | grep PM2 | grep -v grep || print_warning "No PM2 processes found"

print_section "9. FIREWALL & SECURITY"

# Check firewall status
print_info "Firewall status:"
if command -v ufw &> /dev/null; then
    ufw status || print_warning "UFW status check failed"
else
    print_warning "UFW not installed"
fi

# Check iptables
print_info "iptables rules:"
iptables -L -n | head -20 || print_warning "Cannot read iptables rules"

print_section "10. RECOMMENDED ACTIONS"

echo ""
print_info "Based on the diagnostic results, here are recommended actions:"
echo ""

# Provide specific recommendations based on common issues
echo "1. If PM2 is not running:"
echo "   sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production"
echo ""

echo "2. If nginx is not running:"
echo "   systemctl start nginx"
echo "   systemctl enable nginx"
echo ""

echo "3. If application is not responding:"
echo "   sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo ""

echo "4. If nginx configuration is invalid:"
echo "   nginx -t"
echo "   ./setup-nginx.sh"
echo ""

echo "5. If port is blocked:"
echo "   sudo ufw allow ${APP_PORT}"
echo "   sudo ufw allow 80"
echo "   sudo ufw allow 443"
echo ""

echo "6. To rebuild and restart everything:"
echo "   ./complete-deployment-fixed.sh"
echo ""

print_section "DIAGNOSTIC COMPLETE"
echo "Save this report for troubleshooting reference."
echo "Run specific commands based on the recommendations above."