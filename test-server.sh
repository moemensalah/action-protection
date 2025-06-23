#!/bin/bash

cd /home/appuser/latelounge

echo "=== SERVER TEST ==="

echo "1. Checking if built files exist:"
ls -la dist/ | head -10

echo
echo "2. Testing API endpoints:"
curl -s http://localhost:3000/api/categories | head -5

echo
echo "3. Testing static file access:"
curl -I http://localhost:3000/index.html

echo
echo "4. Testing manifest:"
curl -I http://localhost:3000/manifest.json

echo
echo "5. Checking server logs:"
pm2 logs --lines 5

echo
echo "=== END TEST ==="