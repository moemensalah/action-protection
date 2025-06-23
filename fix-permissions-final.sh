#!/bin/bash

echo "=== FIXING FILE PERMISSIONS FOR NGINX ==="

cd /home/appuser/latelounge

# Check current permissions
echo "Current permissions:"
ls -la dist/public/assets/

# Fix directory permissions - nginx needs execute permission on directories
sudo chmod -R 755 /home/appuser/latelounge/
sudo chmod -R 755 /home/appuser/latelounge/dist/
sudo chmod -R 755 /home/appuser/latelounge/dist/public/
sudo chmod -R 755 /home/appuser/latelounge/dist/public/assets/

# Fix file permissions - nginx needs read permission on files
sudo chmod 644 /home/appuser/latelounge/dist/public/assets/*
sudo chmod 644 /home/appuser/latelounge/dist/public/index.html

# Fix ownership - ensure www-data can read everything
sudo chown -R www-data:www-data /home/appuser/latelounge/dist/

# Verify permissions
echo "New permissions:"
ls -la /home/appuser/latelounge/dist/public/assets/

# Test as www-data user
echo "Testing file access as www-data:"
sudo -u www-data head -3 /home/appuser/latelounge/dist/public/assets/index-D9yNFWBb.css

# Test HTTP access
echo "Testing HTTP access:"
curl -s http://localhost/assets/index-D9yNFWBb.css | head -3

# Test HTTPS access
echo "Testing HTTPS access:"
curl -s https://demo2.late-lounge.com/assets/index-D9yNFWBb.css | head -3

echo "=== PERMISSIONS FIX COMPLETE ==="