#!/bin/bash

# Fix production deployment file copy issue
echo "🔧 Fixing Production Deployment File Copy Issue"
echo "================================================"

PROJECT_NAME="action-protection"
APP_USER="actionprotection"
TARGET_DIR="/home/${APP_USER}/${PROJECT_NAME}"
SOURCE_DIR=$(pwd)

echo "Source directory: $SOURCE_DIR"
echo "Target directory: $TARGET_DIR"

# Verify source files exist
if [ ! -f "$SOURCE_DIR/package.json" ]; then
    echo "❌ package.json not found in source directory"
    echo "Available files:"
    ls -la "$SOURCE_DIR"
    exit 1
fi

echo "✅ Source files verified"

# Create target directory structure
echo "📁 Creating target directory structure..."
sudo -u ${APP_USER} mkdir -p "$TARGET_DIR"
sudo -u ${APP_USER} mkdir -p "$TARGET_DIR/logs"

# Copy files using tar to preserve permissions and handle hidden files
echo "📦 Copying project files..."
cd "$SOURCE_DIR"

# Create tar archive excluding problematic directories
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='logs' \
    --exclude='*.log' \
    -cf - . | sudo -u ${APP_USER} tar -xf - -C "$TARGET_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Files copied successfully using tar"
else
    echo "❌ Tar copy failed, trying alternative method..."
    
    # Alternative method: Copy files individually with proper permissions
    echo "📁 Copying files individually..."
    
    # Copy root files
    for file in package.json package-lock.json tsconfig.json vite.config.ts drizzle.config.ts tailwind.config.ts postcss.config.js components.json .gitignore; do
        if [ -f "$SOURCE_DIR/$file" ]; then
            sudo cp "$SOURCE_DIR/$file" "$TARGET_DIR/" 2>/dev/null
            sudo chown ${APP_USER}:${APP_USER} "$TARGET_DIR/$file"
            echo "✅ Copied: $file"
        fi
    done
    
    # Copy directories
    for dir in client server shared public uploads; do
        if [ -d "$SOURCE_DIR/$dir" ]; then
            sudo cp -r "$SOURCE_DIR/$dir" "$TARGET_DIR/" 2>/dev/null
            sudo chown -R ${APP_USER}:${APP_USER} "$TARGET_DIR/$dir"
            echo "✅ Copied directory: $dir"
        fi
    done
fi

# Set proper ownership for entire directory
sudo chown -R ${APP_USER}:${APP_USER} "$TARGET_DIR"

# Verify critical files were copied
echo "🔍 Verifying copied files..."
VERIFICATION_FAILED=false

if [ -f "$TARGET_DIR/package.json" ]; then
    echo "✅ package.json verified"
else
    echo "❌ package.json missing"
    VERIFICATION_FAILED=true
fi

if [ -d "$TARGET_DIR/client" ]; then
    echo "✅ client directory verified"
else
    echo "❌ client directory missing"
    VERIFICATION_FAILED=true
fi

if [ -d "$TARGET_DIR/server" ]; then
    echo "✅ server directory verified"
else
    echo "❌ server directory missing"
    VERIFICATION_FAILED=true
fi

if [ -d "$TARGET_DIR/shared" ]; then
    echo "✅ shared directory verified"
else
    echo "❌ shared directory missing"
    VERIFICATION_FAILED=true
fi

if [ "$VERIFICATION_FAILED" = true ]; then
    echo "❌ File copy verification failed"
    echo "Contents of target directory:"
    ls -la "$TARGET_DIR"
    exit 1
fi

echo "✅ All critical files verified successfully"

# Show final directory structure
echo "📋 Final directory structure:"
ls -la "$TARGET_DIR"

echo ""
echo "🎉 File copy fix completed successfully!"
echo "Now run: cd $TARGET_DIR && npm install"