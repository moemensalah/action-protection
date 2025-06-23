#!/bin/bash

cd /home/appuser/latelounge

echo "Fixing server static file paths..."

# Stop PM2
pm2 stop all

# Rebuild application with the server fix
npm run build

# Check if the files are in the right place
echo "Files in dist:"
ls -la dist/

echo "Files in dist/public:"
ls -la dist/public/

# Restart PM2
pm2 start ecosystem.config.cjs --env production

echo "Testing frontend in 5 seconds..."
sleep 5
curl -I http://localhost:3000

echo "Server fix complete!"