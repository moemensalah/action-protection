#!/bin/bash

echo "=== PM2 STATUS AND LOGS ==="

echo "1. PM2 Status:"
pm2 status

echo -e "\n2. PM2 Logs (last 20 lines):"
pm2 logs --lines 20

echo -e "\n3. PM2 Error Logs:"
pm2 logs --err --lines 10

echo -e "\n4. Checking if application is responding:"
curl -v http://localhost:3000/api/categories 2>&1 | head -10

echo -e "\n5. Process information:"
ps aux | grep node | grep -v grep

echo -e "\n=== END DIAGNOSTICS ==="