#!/bin/bash

# ========================================================================
# LateLounge Production Update Script
# ========================================================================
# 
# Created by: The ORCAS Team
# Author: Haitham Amin - CEO
# 
# Purpose: Quick update script to pull latest changes from Git and 
# restart the production application without full redeployment
#
# Usage: ./update-production.sh
# ========================================================================

set -e

# Configuration
PROJECT_NAME="latelounge"
APP_USER="appuser"
APP_PORT="3000"

echo "🔄 Updating LateLounge Production..."

# Navigate to project directory
cd /home/${APP_USER}/${PROJECT_NAME}

# Pull latest changes from Git
echo "📥 Pulling latest changes from Git..."
sudo -u ${APP_USER} git fetch origin
sudo -u ${APP_USER} git reset --hard origin/main
sudo -u ${APP_USER} git pull origin main
echo "✅ Latest changes pulled successfully"

# Copy updated assets
echo "📋 Copying updated assets..."
sudo -u ${APP_USER} mkdir -p client/public/assets

# Copy logos
if [ -f "attached_assets/english-dark_1750523791780.png" ]; then
    sudo -u ${APP_USER} cp "attached_assets/english-dark_1750523791780.png" "client/public/assets/"
fi
if [ -f "attached_assets/english-white_1750523827323.png" ]; then
    sudo -u ${APP_USER} cp "attached_assets/english-white_1750523827323.png" "client/public/assets/"
fi

# Copy hero background images
if [ -f "attached_assets/artisan-coffee-pastry-delight-91179007_1750782813470.jpg" ]; then
    sudo -u ${APP_USER} cp "attached_assets/artisan-coffee-pastry-delight-91179007_1750782813470.jpg" "client/public/assets/"
fi
if [ -f "attached_assets/friends-engaging-over-hookah-in-a-cozy-lounge-71035690_1750782931870.jpg" ]; then
    sudo -u ${APP_USER} cp "attached_assets/friends-engaging-over-hookah-in-a-cozy-lounge-71035690_1750782931870.jpg" "client/public/assets/"
fi

# Install any new dependencies
echo "📦 Installing dependencies..."
sudo -u ${APP_USER} npm install

# Rebuild application
echo "🔨 Rebuilding application..."
sudo -u ${APP_USER} npm run build

# Fix production static file structure
echo "🔧 Configuring production static file structure..."
if [ -d "dist" ]; then
    sudo -u ${APP_USER} mkdir -p dist/public
    
    # Move main files to public directory
    if [ -f "dist/index.html" ]; then
        sudo -u ${APP_USER} mv "dist/index.html" "dist/public/" 2>/dev/null || true
    fi
    if [ -f "dist/manifest.json" ]; then
        sudo -u ${APP_USER} mv "dist/manifest.json" "dist/public/" 2>/dev/null || true
    fi
    if [ -d "dist/assets" ] && [ ! -d "dist/public/assets" ]; then
        sudo -u ${APP_USER} mv "dist/assets" "dist/public/" 2>/dev/null || true
    fi
    
    # Copy assets to final production location
    sudo -u ${APP_USER} mkdir -p dist/public/assets
    sudo -u ${APP_USER} cp client/public/assets/* dist/public/assets/ 2>/dev/null || true
fi

# Run database migrations (if any)
echo "🗄️ Running database migrations..."
sudo -u ${APP_USER} npm run db:push

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart ${PROJECT_NAME} || pm2 start ecosystem.config.cjs

# Show status
echo "📊 Application status:"
pm2 status ${PROJECT_NAME}

echo "✅ Production update completed successfully!"
echo "🌐 Application is running on port ${APP_PORT}"