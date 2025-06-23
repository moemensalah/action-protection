#!/bin/bash

cd /home/appuser/latelounge

echo "=== DEBUGGING BLANK PAGE ==="

echo "1. Testing API responses:"
curl -s http://localhost:3000/api/categories | head -30

echo -e "\n2. Testing frontend HTML:"
curl -s http://localhost:3000/ | head -20

echo -e "\n3. Testing CSS and JS assets:"
curl -I http://localhost:3000/assets/index-D9yNFWBb.css
curl -I http://localhost:3000/assets/index-Db2z8t11.js

echo -e "\n4. Checking PM2 logs for errors:"
pm2 logs --lines 10

echo -e "\n5. Testing with user agent:"
curl -H "User-Agent: Mozilla/5.0" -s http://localhost:3000/ | head -30

echo "=== DEBUG COMPLETE ==="