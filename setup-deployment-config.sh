#!/bin/bash

# ========================================================================
# Setup Deployment Configuration - Action Protection
# ========================================================================

echo "🔧 Setting up deployment configuration for Action Protection..."
echo ""

# Get repository URL from user
echo "Please provide your Git repository URL:"
echo "Example: https://github.com/yourusername/action-protection.git"
echo "Or press Enter to use local files mode:"
read -r GIT_REPO

# Get branch name
if [ -n "$GIT_REPO" ]; then
    echo ""
    echo "Please provide the branch name (default: main):"
    read -r GIT_BRANCH
    GIT_BRANCH=${GIT_BRANCH:-main}
fi

# Get domain name
echo ""
echo "Please provide your domain name (default: demox.actionprotectionkw.com):"
read -r DOMAIN
DOMAIN=${DOMAIN:-demox.actionprotectionkw.com}

# Get port number
echo ""
echo "Please provide the port number (default: 4000):"
read -r PORT
PORT=${PORT:-4000}

# Update the deployment script
echo ""
echo "Updating deployment script configuration..."

# Create backup of original script
cp complete-production-deployment.sh complete-production-deployment.sh.backup

# Update configuration variables
sed -i "s|GIT_REPO=\"https://github.com/user/action-protection.git\".*|GIT_REPO=\"$GIT_REPO\"|g" complete-production-deployment.sh
sed -i "s|GIT_BRANCH=\"main\"|GIT_BRANCH=\"$GIT_BRANCH\"|g" complete-production-deployment.sh
sed -i "s|DOMAIN=\"demox.actionprotectionkw.com\"|DOMAIN=\"$DOMAIN\"|g" complete-production-deployment.sh
sed -i "s|PORT=4000|PORT=$PORT|g" complete-production-deployment.sh

echo ""
echo "✅ Configuration updated successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   - Git Repository: ${GIT_REPO:-"Local files mode"}"
if [ -n "$GIT_REPO" ]; then
    echo "   - Git Branch: $GIT_BRANCH"
fi
echo "   - Domain: $DOMAIN"
echo "   - Port: $PORT"
echo ""
echo "🚀 Your deployment script is now configured!"
echo "Run: ./complete-production-deployment.sh"
echo ""
echo "📁 Backup created: complete-production-deployment.sh.backup"