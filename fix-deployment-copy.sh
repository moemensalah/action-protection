#!/bin/bash

# Fix deployment copy issue
echo "🔧 Fixing deployment file copy issue"
echo "===================================="

PROJECT_NAME="action-protection"
APP_USER="actionprotection"
TARGET_DIR="/home/${APP_USER}/${PROJECT_NAME}"
CURRENT_DIR=$(pwd)

echo "Current directory: $CURRENT_DIR"
echo "Target directory: $TARGET_DIR"

# Create target directory
sudo -u ${APP_USER} mkdir -p "$TARGET_DIR"

# Method 1: Direct copy with exclusions
echo "1. Attempting direct copy..."
if sudo rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='logs' \
   "$CURRENT_DIR/" "$TARGET_DIR/" 2>/dev/null; then
    echo "✅ Direct copy successful using rsync"
else
    echo "❌ rsync failed, trying alternative method..."
    
    # Method 2: Copy essential files manually
    echo "2. Copying essential files manually..."
    
    # Copy root files
    for file in package.json package-lock.json tsconfig.json vite.config.ts drizzle.config.ts tailwind.config.ts postcss.config.js components.json .gitignore; do
        if [ -f "$CURRENT_DIR/$file" ]; then
            sudo cp "$CURRENT_DIR/$file" "$TARGET_DIR/" 2>/dev/null && echo "✅ Copied: $file"
        fi
    done
    
    # Copy directories
    for dir in client server shared public uploads; do
        if [ -d "$CURRENT_DIR/$dir" ]; then
            sudo cp -r "$CURRENT_DIR/$dir" "$TARGET_DIR/" 2>/dev/null && echo "✅ Copied directory: $dir"
        fi
    done
fi

# Set proper ownership
sudo chown -R ${APP_USER}:${APP_USER} "$TARGET_DIR"

# Verify critical files
echo "3. Verifying critical files..."
if [ -f "$TARGET_DIR/package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -d "$TARGET_DIR/client" ]; then
    echo "✅ client directory exists"
else
    echo "❌ client directory missing"
    exit 1
fi

if [ -d "$TARGET_DIR/server" ]; then
    echo "✅ server directory exists"
else
    echo "❌ server directory missing"
    exit 1
fi

if [ -d "$TARGET_DIR/shared" ]; then
    echo "✅ shared directory exists"
else
    echo "❌ shared directory missing"
    exit 1
fi

echo ""
echo "✅ File copy verification complete!"
echo "Files in target directory:"
ls -la "$TARGET_DIR"

echo ""
echo "Now run: cd $TARGET_DIR && npm install"