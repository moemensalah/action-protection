#!/bin/bash

echo "=== COMPLETE SERVER PERMISSION FIX ==="

cd /home/appuser/latelounge

# Check current ownership and permissions
echo "Current file ownership:"
ls -la dist/public/assets/

# Check if files actually exist
echo "Checking if files exist:"
file dist/public/assets/index-D9yNFWBb.css
file dist/public/assets/index-Db2z8t11.js

# Check directory structure
echo "Directory structure:"
find dist/ -type f -name "*.css" -o -name "*.js" | head -10

# Stop any processes that might be locking files
sudo fuser -k dist/public/assets/* 2>/dev/null || true

# Force rebuild to ensure fresh files
echo "Rebuilding to ensure fresh files..."
sudo rm -rf dist/
npm run build

# Set permissions properly after rebuild
echo "Setting permissions on newly built files:"
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/
sudo find dist/ -type f -exec chmod 644 {} \;

# Test file access
echo "Testing file access:"
sudo -u www-data cat dist/public/assets/index-D9yNFWBb.css | head -3 2>/dev/null || echo "Still can't read file"

# Check SELinux status (if applicable)
getenforce 2>/dev/null || echo "SELinux not installed"

# Alternative: Create a simple test file
echo "Creating test file:"
echo "/* Test CSS */" | sudo tee dist/public/assets/test.css
sudo chown www-data:www-data dist/public/assets/test.css
sudo chmod 644 dist/public/assets/test.css

# Test the simple file
curl -I http://localhost/assets/test.css

echo "=== COMPLETE SERVER FIX DONE ==="