#!/bin/bash

echo "=== DIAGNOSING SERVER CONFIGURATION ==="

# Check if there are multiple Nginx configs
echo "1. Checking all Nginx site configurations:"
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/sites-available/

# Check for SSL/HTTPS configurations
echo -e "\n2. Checking for SSL configurations:"
grep -r "ssl" /etc/nginx/sites-available/ 2>/dev/null || echo "No SSL configs found"
grep -r "443" /etc/nginx/sites-available/ 2>/dev/null || echo "No port 443 configs found"

# Check current Nginx processes and what they're serving
echo -e "\n3. Checking Nginx status:"
sudo systemctl status nginx | head -10

# Check what's actually being served
echo -e "\n4. Testing direct file access:"
ls -la /home/appuser/latelounge/dist/public/assets/
file /home/appuser/latelounge/dist/public/assets/index-D9yNFWBb.css

# Test if the file is actually CSS or HTML
echo -e "\n5. Checking file content:"
head -3 /home/appuser/latelounge/dist/public/assets/index-D9yNFWBb.css

# Check Nginx error logs
echo -e "\n6. Checking Nginx error log:"
sudo tail -10 /var/log/nginx/error.log

# Test local HTTP request
echo -e "\n7. Testing local HTTP request:"
curl -I http://localhost/assets/index-D9yNFWBb.css

echo "=== DIAGNOSIS COMPLETE ==="