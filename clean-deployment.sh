#!/bin/bash

# ========================================================================
# Clean Deployment - Action Protection
# ========================================================================

set -e

# Configuration
PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
DB_NAME="actionprotection_db"
DB_USER="actionprotection"

echo "🧹 Cleaning previous Action Protection deployment..."
echo "This will remove the existing deployment and prepare for fresh installation."
echo ""

# Confirm with user
read -p "Are you sure you want to clean the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop action-protection 2>/dev/null || true
sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true

# Remove project directory
echo "2. Removing project directory..."
if [ -d "$PROJECT_DIR" ]; then
    sudo rm -rf $PROJECT_DIR
    echo "✅ Project directory removed"
else
    echo "ℹ️  Project directory doesn't exist"
fi

# Remove database (optional)
read -p "Do you want to remove the database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "3. Removing database..."
    sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
EOF
    echo "✅ Database removed"
else
    echo "3. Keeping database intact"
fi

# Remove nginx configuration
echo "4. Removing nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/action-protection
sudo rm -f /etc/nginx/sites-available/action-protection
sudo systemctl reload nginx 2>/dev/null || true
echo "✅ Nginx configuration removed"

# Clean PM2 startup
echo "5. Cleaning PM2 startup..."
sudo -u $APP_USER pm2 unstartup systemd 2>/dev/null || true
echo "✅ PM2 startup cleaned"

echo ""
echo "🎉 Deployment cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "   - You can now run ./complete-production-deployment.sh for fresh installation"
echo "   - All services have been stopped and configurations removed"
echo "   - The system is ready for new deployment"