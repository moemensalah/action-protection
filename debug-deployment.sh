#!/bin/bash

# Debug deployment script to find source files
echo "🔍 Debugging Deployment File Structure"
echo "====================================="

PROJECT_NAME="action-protection"
APP_USER="actionprotection"

echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"

echo ""
echo "📁 Checking /home/actionprotection/action-protection directory:"
if [ -d "/home/actionprotection/action-protection" ]; then
    echo "✅ Directory exists"
    echo "Contents:"
    ls -la /home/actionprotection/action-protection
    echo ""
    echo "Checking for package.json:"
    if [ -f "/home/actionprotection/action-protection/package.json" ]; then
        echo "✅ package.json found!"
        echo "Package.json content (first 10 lines):"
        head -10 /home/actionprotection/action-protection/package.json
    else
        echo "❌ package.json not found"
    fi
else
    echo "❌ Directory does not exist"
fi

echo ""
echo "🔍 Searching for package.json files in home directories:"
find /home -name "package.json" -type f 2>/dev/null | head -10

echo ""
echo "🔍 Searching for action-protection directories:"
find /home -name "*action-protection*" -type d 2>/dev/null | head -10

echo ""
echo "📋 File permissions for actionprotection user:"
ls -la /home/actionprotection/

echo ""
echo "🔧 Testing access to actionprotection directory:"
if sudo -u actionprotection test -r /home/actionprotection/action-protection/package.json 2>/dev/null; then
    echo "✅ actionprotection user can read package.json"
else
    echo "❌ actionprotection user cannot read package.json"
fi

echo ""
echo "🎯 Recommended action:"
echo "If package.json exists in /home/actionprotection/action-protection/, run:"
echo "  cd /home/actionprotection/action-protection"
echo "  sudo -u actionprotection ./complete-working-deployment.sh"