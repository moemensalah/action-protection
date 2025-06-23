#!/bin/bash

cd /home/appuser/latelounge

echo "=== FIXING FRONTEND SERVING ==="

echo "1. Checking if dist files exist:"
ls -la dist/ | head -10

echo "2. Checking if index.html exists:"
ls -la dist/index.html

echo "3. Testing direct file access:"
curl -I http://localhost:3000/index.html

echo "4. Checking nginx configuration:"
curl -I http://$(curl -s ifconfig.me)

echo "5. Checking if uploads directory exists:"
mkdir -p uploads

echo "6. Testing nginx proxy:"
sudo nginx -t

echo "=== DIAGNOSTICS COMPLETE ==="