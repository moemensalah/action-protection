#!/bin/bash

# ========================================================================
# Test Git Setup and Repository Access
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🧪 Testing Git setup..."

# Navigate to project directory
cd $PROJECT_DIR

# Test git status
echo "1. Testing git status..."
sudo -u $APP_USER git status

# Test remote connection
echo "2. Testing remote repository connection..."
sudo -u $APP_USER git remote -v

# Test fetch
echo "3. Testing git fetch..."
if sudo -u $APP_USER git fetch origin; then
    echo "✅ Git fetch successful"
else
    echo "❌ Git fetch failed"
    echo "💡 This may indicate:"
    echo "   - Repository doesn't exist"
    echo "   - Authentication issues"
    echo "   - Network connectivity problems"
fi

# Test pull
echo "4. Testing git pull..."
if sudo -u $APP_USER git pull origin main; then
    echo "✅ Git pull successful"
else
    echo "❌ Git pull failed"
    echo "💡 This may indicate:"
    echo "   - No commits in remote repository"
    echo "   - Branch name mismatch"
    echo "   - Authentication issues"
fi

# Show git log
echo "5. Showing git log..."
sudo -u $APP_USER git log --oneline -5 || echo "No commits found"

# Show git configuration
echo "6. Showing git configuration..."
sudo -u $APP_USER git config --list

echo ""
echo "✅ Git setup test completed!"
echo ""
echo "🔧 Useful git commands:"
echo "   sudo -u $APP_USER git status"
echo "   sudo -u $APP_USER git pull origin main"
echo "   sudo -u $APP_USER git add ."
echo "   sudo -u $APP_USER git commit -m 'Update message'"
echo "   sudo -u $APP_USER git push origin main"