#!/bin/bash

# ========================================================================
# Git Reset Production Repository
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔄 Resetting git repository to clean state..."

cd $PROJECT_DIR

# Show current git status
echo "1. Current git status:"
sudo -u $APP_USER git status || echo "No git repository found"

# Reset to clean state
echo "2. Resetting to clean state..."
sudo -u $APP_USER git reset --hard HEAD

# Clean untracked files
echo "3. Cleaning untracked files..."
sudo -u $APP_USER git clean -fd

# Show final status
echo "4. Final git status:"
sudo -u $APP_USER git status

# If there are still conflicts, force reset to remote
echo "5. Force reset to match remote repository..."
if sudo -u $APP_USER git fetch origin main; then
    sudo -u $APP_USER git reset --hard origin/main
    echo "✅ Reset to match remote repository"
else
    echo "⚠️  No remote repository or fetch failed"
fi

echo ""
echo "✅ Git reset completed!"
echo ""
echo "🔧 Repository is now in clean state"
echo "📋 Next steps:"
echo "   sudo -u $APP_USER git status"
echo "   sudo -u $APP_USER git pull origin main"