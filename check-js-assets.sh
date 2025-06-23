#!/bin/bash

cd /home/appuser/latelounge

echo "=== CHECKING JAVASCRIPT ASSETS ==="

echo "1. Testing CSS asset:"
curl -I http://localhost:3000/assets/index-D9yNFWBb.css

echo -e "\n2. Testing JS asset:"
curl -I http://localhost:3000/assets/index-Db2z8t11.js

echo -e "\n3. Checking assets directory:"
ls -la dist/public/assets/

echo -e "\n4. Testing asset loading in HTML:"
curl -s http://localhost:3000/ | grep -E "(\.css|\.js)"

echo -e "\n5. Testing direct asset access:"
curl -s http://localhost:3000/assets/ | head -10

echo "=== ASSET CHECK COMPLETE ==="