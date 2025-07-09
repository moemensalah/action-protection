#!/bin/bash

# Simple deployment runner script
# This script should be placed in the directory containing the source files

PROJECT_NAME="action-protection"
APP_USER="actionprotection"

echo "🚀 Action Protection Deployment Runner"
echo "====================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in current directory"
    echo "Please run this script from the project root directory containing package.json"
    exit 1
fi

echo "✅ Source files found in current directory"

# Check if the main deployment script exists
if [ ! -f "complete-working-deployment.sh" ]; then
    echo "❌ Error: complete-working-deployment.sh not found"
    echo "Please ensure the deployment script is in the same directory"
    exit 1
fi

echo "✅ Deployment script found"

# Make sure deployment script is executable
chmod +x complete-working-deployment.sh

# Run the deployment script
echo "🔧 Running deployment script..."
./complete-working-deployment.sh

echo "🎉 Deployment runner completed!"