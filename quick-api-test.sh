#!/bin/bash

# Quick API Test Script
echo "=== API Endpoint Testing ==="

echo "1. Testing basic connectivity to port 4000:"
nc -zv localhost 4000

echo ""
echo "2. Testing HTTP response with verbose output:"
curl -v http://localhost:4000/api/contact

echo ""
echo "3. Testing root endpoint:"
curl -v http://localhost:4000/

echo ""
echo "4. Testing with timeout:"
timeout 10 curl -s http://localhost:4000/api/contact

echo ""
echo "5. Checking application logs:"
sudo -u actionprotection pm2 logs action-protection --lines 10

echo ""
echo "6. Testing nginx proxy:"
curl -v http://localhost:80

echo ""
echo "7. Testing domain access:"
curl -v http://demox.actionprotectionkw.com

echo ""
echo "=== Test Complete ==="