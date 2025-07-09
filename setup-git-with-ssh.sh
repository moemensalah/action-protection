#!/bin/bash

# ========================================================================
# Setup Git with SSH Keys for Production Environment
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
SSH_EMAIL="admin@actionprotection.com"
GIT_REPO_URL="git@github.com:your-username/action-protection.git"  # UPDATE THIS

echo "🔐 Setting up Git with SSH authentication..."

# Generate SSH key for the app user
echo "1. Generating SSH key for $APP_USER..."
sudo -u $APP_USER mkdir -p /home/$APP_USER/.ssh
sudo -u $APP_USER ssh-keygen -t rsa -b 4096 -C "$SSH_EMAIL" -f /home/$APP_USER/.ssh/id_rsa -N ""

# Set proper permissions
sudo -u $APP_USER chmod 700 /home/$APP_USER/.ssh
sudo -u $APP_USER chmod 600 /home/$APP_USER/.ssh/id_rsa
sudo -u $APP_USER chmod 644 /home/$APP_USER/.ssh/id_rsa.pub

# Display public key
echo "2. SSH Public Key (add this to your GitHub/GitLab):"
echo "=================================================="
cat /home/$APP_USER/.ssh/id_rsa.pub
echo "=================================================="

# Add GitHub to known hosts
echo "3. Adding GitHub to known hosts..."
sudo -u $APP_USER ssh-keyscan -H github.com >> /home/$APP_USER/.ssh/known_hosts

# Configure git user
echo "4. Configuring git user..."
sudo -u $APP_USER git config --global user.name "Action Protection Production"
sudo -u $APP_USER git config --global user.email "$SSH_EMAIL"

# Navigate to project directory
cd $PROJECT_DIR

# Initialize git repository
echo "5. Initializing git repository..."
sudo -u $APP_USER git init

# Add remote origin with SSH
echo "6. Adding SSH remote repository..."
sudo -u $APP_USER git remote add origin $GIT_REPO_URL

# Create .gitignore
echo "7. Creating .gitignore file..."
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
echo "8. Staging all files..."
sudo -u $APP_USER git add .

# Create initial commit
echo "9. Creating initial commit..."
sudo -u $APP_USER git commit -m "Initial production deployment with SSH setup"

# Set up branch tracking
echo "10. Setting up branch tracking..."
sudo -u $APP_USER git branch -M main

echo ""
echo "✅ Git with SSH setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy the SSH public key above to your GitHub/GitLab account"
echo "   2. Create repository at: $GIT_REPO_URL"
echo "   3. Test SSH connection: sudo -u $APP_USER ssh -T git@github.com"
echo "   4. Push to remote: sudo -u $APP_USER git push -u origin main"
echo ""
echo "🔧 Git commands for production:"
echo "   cd $PROJECT_DIR"
echo "   sudo -u $APP_USER git status"
echo "   sudo -u $APP_USER git pull origin main"
echo "   sudo -u $APP_USER git push origin main"
echo ""
echo "🔐 SSH Key location:"
echo "   Public key: /home/$APP_USER/.ssh/id_rsa.pub"
echo "   Private key: /home/$APP_USER/.ssh/id_rsa"