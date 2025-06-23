#!/bin/bash
# Quick production fix
export NODE_ENV=production
export PORT=3000

echo "Setting production environment..."
echo "Building application..."
npm run build

echo "Starting production server..."
node dist/index.js