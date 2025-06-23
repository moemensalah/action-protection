#!/bin/bash

cd /home/appuser/latelounge

echo "=== DEBUGGING ASSETS STRUCTURE ==="

echo "1. Checking dist directory structure:"
ls -la dist/

echo -e "\n2. Checking dist/public directory:"
ls -la dist/public/

echo -e "\n3. Checking assets directory:"
ls -la dist/public/assets/ 2>/dev/null || echo "assets directory not found"

echo -e "\n4. Finding all CSS and JS files:"
find dist/ -name "*.css" -o -name "*.js" | head -10

echo -e "\n5. Checking index.html content for asset references:"
grep -E "(\.css|\.js)" dist/public/index.html 2>/dev/null || echo "index.html not found"

echo -e "\n6. Rebuilding to ensure fresh assets:"
npm run build

echo -e "\n7. After rebuild - checking assets:"
ls -la dist/public/assets/ 2>/dev/null || echo "Still no assets directory"

echo -e "\n8. Checking if files are in dist root instead:"
ls -la dist/*.css dist/*.js 2>/dev/null || echo "No CSS/JS in dist root"

echo "=== ASSETS STRUCTURE DEBUG COMPLETE ==="