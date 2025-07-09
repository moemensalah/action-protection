#!/bin/bash

# Debug Git clone issue
echo "🔍 Debugging Git Clone Issue"
echo "============================"

GIT_REPO_URL="https://github.com/moemensalah/action-protection.git"
PROJECT_NAME="action-protection"
APP_USER="actionprotection"
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"

echo "Repository URL: $GIT_REPO_URL"
echo "Target directory: $PROJECT_DIR"
echo ""

# Test 1: Check if Git is installed
echo "1. Checking Git installation..."
if command -v git &> /dev/null; then
    echo "✅ Git installed: $(git --version)"
else
    echo "❌ Git not installed"
    echo "   Installing Git..."
    apt update && apt install -y git
fi
echo ""

# Test 2: Test repository accessibility
echo "2. Testing repository accessibility..."
if git ls-remote "$GIT_REPO_URL" &>/dev/null; then
    echo "✅ Repository is accessible"
else
    echo "❌ Repository not accessible or private"
    echo "   Possible issues:"
    echo "   - Repository is private (needs authentication)"
    echo "   - Network/firewall blocking access"
    echo "   - Repository doesn't exist"
fi
echo ""

# Test 3: Try cloning with verbose output
echo "3. Testing clone with verbose output..."
TEMP_DIR="/tmp/test-clone-$$"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "Attempting to clone..."
if git clone --verbose "$GIT_REPO_URL" test-repo 2>&1; then
    echo "✅ Clone successful"
    echo "Repository contents:"
    ls -la test-repo/
    rm -rf test-repo
else
    echo "❌ Clone failed"
    echo "Error details shown above"
fi
cd /
rm -rf "$TEMP_DIR"
echo ""

# Test 4: Check if repository exists without .git extension
echo "4. Testing repository URL without .git extension..."
REPO_URL_NO_GIT="https://github.com/moemensalah/action-protection"
if curl -s -I "$REPO_URL_NO_GIT" | grep -q "200 OK"; then
    echo "✅ Repository page exists: $REPO_URL_NO_GIT"
else
    echo "❌ Repository page not accessible"
fi
echo ""

# Test 5: Check network connectivity
echo "5. Testing network connectivity..."
if ping -c 3 github.com &>/dev/null; then
    echo "✅ Can reach GitHub"
else
    echo "❌ Cannot reach GitHub"
fi
echo ""

# Solutions based on findings
echo "🔧 Possible Solutions:"
echo "====================="
echo ""
echo "Solution 1: Use HTTPS with authentication (if private repo)"
echo "  git clone https://username:token@github.com/moemensalah/action-protection.git"
echo ""
echo "Solution 2: Use current directory fallback (already implemented)"
echo "  Copy source files manually to deployment directory"
echo ""
echo "Solution 3: Make repository public"
echo "  Change repository visibility in GitHub settings"
echo ""
echo "Solution 4: Use SSH key authentication"
echo "  git clone git@github.com:moemensalah/action-protection.git"
echo ""

# Current directory fallback check
echo "Current directory fallback status:"
if [ -d "$PROJECT_DIR" ]; then
    echo "✅ Project directory exists: $PROJECT_DIR"
    if [ -f "$PROJECT_DIR/package.json" ]; then
        echo "✅ Source files copied successfully"
        echo "   Deployment can continue without Git clone"
    else
        echo "❌ Source files not copied"
    fi
else
    echo "❌ Project directory not found"
fi