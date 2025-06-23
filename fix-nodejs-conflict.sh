#!/bin/bash

# Quick fix for Node.js/npm package conflicts on Ubuntu
set -e

echo "🔧 Fixing Node.js/npm package conflicts..."

# Remove conflicting packages
echo "Removing conflicting Node.js packages..."
apt remove -y nodejs npm node-* 2>/dev/null || true
apt autoremove -y
apt autoclean

# Clear package cache
apt update

# Install Node.js 20 from NodeSource
echo "Installing Node.js 20 from NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
echo "Verifying installation..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Fix npm permissions
npm config set fund false
npm config set audit false

echo "✅ Node.js/npm conflict resolved!"
echo "You can now run the deployment script again."