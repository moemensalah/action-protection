#!/bin/bash

# ========================================================================
# Fix Git Permissions and Setup Repository
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔧 Fixing git permissions and setting up repository..."

# Navigate to project directory
cd $PROJECT_DIR

# Remove any existing .git directory to start fresh
echo "1. Removing existing .git directory..."
sudo rm -rf .git

# Fix all file permissions first
echo "2. Fixing file permissions..."
sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Initialize git repository as the correct user
echo "3. Initializing git repository as $APP_USER..."
sudo -u $APP_USER git init

# Configure git user
echo "4. Configuring git user..."
sudo -u $APP_USER git config user.name "Action Protection Production"
sudo -u $APP_USER git config user.email "admin@actionprotection.com"

# Create .gitignore
echo "5. Creating .gitignore..."
sudo -u $APP_USER cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# PM2 ecosystem files
ecosystem.config.js
ecosystem.config.cjs

# Uploads
uploads/

# Database
*.db
*.sqlite

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
tmp/
temp/
EOF

# Stage all files
echo "6. Staging all files..."
sudo -u $APP_USER git add .

# Create initial commit
echo "7. Creating initial commit..."
sudo -u $APP_USER git commit -m "Initial production deployment commit"

# Set up branch
echo "8. Setting up main branch..."
sudo -u $APP_USER git branch -M main

echo ""
echo "✅ Git permissions fixed and repository initialized!"
echo ""
echo "📋 Next steps:"
echo "   1. Add your remote repository:"
echo "      sudo -u $APP_USER git remote add origin https://github.com/your-username/action-protection.git"
echo ""
echo "   2. Push to remote:"
echo "      sudo -u $APP_USER git push -u origin main"
echo ""
echo "   3. Test git status:"
echo "      sudo -u $APP_USER git status"
echo ""
echo "🔧 Git is now ready for use!"