#!/bin/bash

echo "=== SERVER DIAGNOSTICS ==="
echo

echo "1. Checking PM2 status:"
pm2 status

echo
echo "2. Checking PM2 logs:"
pm2 logs --lines 20

echo
echo "3. Checking if port 3000 is in use:"
netstat -tulpn | grep :3000

echo
echo "4. Checking Node.js processes:"
ps aux | grep node

echo
echo "5. Checking if app directory exists:"
ls -la /home/appuser/latelounge/

echo
echo "6. Checking if built files exist:"
ls -la /home/appuser/latelounge/dist/

echo
echo "7. Checking ecosystem.config.cjs:"
cat /home/appuser/latelounge/ecosystem.config.cjs

echo
echo "8. Testing local connection:"
curl -v http://localhost:3000 2>&1 | head -10

echo
echo "=== END DIAGNOSTICS ==="