#!/bin/bash

# ========================================================================
# Setup Git Repository in Production Environment
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
GIT_REPO_URL="https://github.com/your-username/action-protection.git"  # UPDATE THIS

echo "🔧 Setting up Git repository in production environment..."

# Navigate to project directory
cd $PROJECT_DIR

# Initialize git repository
echo "1. Initializing git repository..."
sudo -u $APP_USER git init

# Add remote origin
echo "2. Adding remote repository..."
sudo -u $APP_USER git remote add origin $GIT_REPO_URL

# Create .gitignore if it doesn't exist
echo "3. Creating .gitignore file..."
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

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

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

# PM2 logs
ecosystem.config.js
*.log

# Uploads
uploads/

# Database
*.db
*.sqlite

# Temporary files
tmp/
temp/
EOF

# Stage all files
echo "4. Staging all files..."
sudo -u $APP_USER git add .

# Create initial commit
echo "5. Creating initial commit..."
sudo -u $APP_USER git commit -m "Initial production deployment commit"

# Set up branch tracking
echo "6. Setting up branch tracking..."
sudo -u $APP_USER git branch -M main

# Push to remote (this will fail if repository doesn't exist)
echo "7. Attempting to push to remote repository..."
if sudo -u $APP_USER git push -u origin main; then
    echo "✅ Successfully pushed to remote repository"
else
    echo "⚠️  Push failed - repository may not exist or need authentication"
    echo "📋 Repository URL: $GIT_REPO_URL"
    echo "💡 You may need to:"
    echo "   1. Create the repository on GitHub/GitLab"
    echo "   2. Set up SSH keys or authentication"
    echo "   3. Update the GIT_REPO_URL in this script"
fi

# Test git status
echo "8. Testing git status..."
sudo -u $APP_USER git status

echo ""
echo "✅ Git setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Create repository at: $GIT_REPO_URL"
echo "   2. Update GIT_REPO_URL in this script if needed"
echo "   3. Test git pull: sudo -u $APP_USER git pull origin main"
echo "   4. Test git push: sudo -u $APP_USER git push origin main"
echo ""
echo "🔧 Git commands for production:"
echo "   cd $PROJECT_DIR"
echo "   sudo -u $APP_USER git status"
echo "   sudo -u $APP_USER git pull origin main"
echo "   sudo -u $APP_USER git push origin main"
echo "   sudo -u $APP_USER git log --oneline -10"