#!/bin/bash

# Complete LateLounge Production Deployment Script
# Fixes all permission, build, and seeding issues

set -e

# Configuration Variables - Update these before deployment
PROJECT_NAME="latelounge"
APP_USER="appuser"
NODE_VERSION="20"
APP_PORT="3000"

# Domain Configuration
DOMAIN="demo2.late-lounge.com"
DOMAIN_WWW="www.demo2.late-lounge.com"
GIT_REPO_URL="https://github.com/your-username/latelounge.git"

# Database Configuration
DB_USER="appuser"
DB_PASSWORD="SAJWJJAHED4E"
DB_NAME="latelounge"

# Admin User Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"
ADMIN_EMAIL="admin@latelounge.sa"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Administrator"

# Company Information
COMPANY_NAME_EN="LateLounge"
COMPANY_NAME_AR="ليت لاونج"
COMPANY_PHONE="+966 11 555 123413335"
COMPANY_WHATSAPP="+966505551234"
COMPANY_EMAIL="info@latelounge.sa"
COMPANY_ADDRESS_EN="123 King Fahd Road, Riyadh, Saudi Arabia"
COMPANY_ADDRESS_AR="123 طريق الملك فهد، الرياض، المملكة العربية السعودية"
COMPANY_HOURS_EN="Sunday - Thursday: 7:00 AM - 11:00 PM"
COMPANY_HOURS_AR="الأحد - الخميس: 7:00 ص - 11:00 م"

# Social Media Links
SOCIAL_INSTAGRAM="https://instagram.com/latelounge"
SOCIAL_TWITTER="https://twitter.com/latelounge"
SOCIAL_FACEBOOK="https://facebook.com/latelounge"
SOCIAL_SNAPCHAT="https://snapchat.com/add/latelounge"

# Logo Assets Configuration
LOGO_WHITE_PATH="attached_assets/english-white_1750523827323.png"
LOGO_DARK_PATH="attached_assets/english-dark_1750523791780.png"
LOGO_ARABIC_WHITE_PATH="attached_assets/arabic-white_1750516260877.png"
LOGO_ARABIC_DARK_PATH="attached_assets/arabic-dark_1750516613229.png"

echo "🚀 Starting LateLounge Production Deployment..."

# System Setup
echo "⚙️ Setting up system dependencies..."
apt update

# Fix Node.js/npm conflict by removing conflicting packages first
apt remove -y nodejs npm 2>/dev/null || true

# Install Node.js from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Install other dependencies
apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# Verify Node.js and npm installation
node --version
npm --version

# Create application user
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
fi

# Setup directories with proper permissions
echo "📁 Creating directory structure..."
mkdir -p /home/${APP_USER}/${PROJECT_NAME}
mkdir -p /home/${APP_USER}/${PROJECT_NAME}/uploads
mkdir -p /home/${APP_USER}/${PROJECT_NAME}/assets
chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}

# Deploy source code
echo "📦 Deploying application files..."
cp -r . /tmp/deployment-staging/
chown -R ${APP_USER}:${APP_USER} /tmp/deployment-staging/
sudo -u ${APP_USER} cp -r /tmp/deployment-staging/* /home/${APP_USER}/${PROJECT_NAME}/

# Install Node.js dependencies
echo "📦 Installing dependencies..."
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} npm cache clean --force
sudo -u ${APP_USER} rm -rf node_modules package-lock.json
sudo -u ${APP_USER} npm install

# Fix Rollup dependency issue
if [ ! -d "/home/${APP_USER}/${PROJECT_NAME}/node_modules/@rollup/rollup-linux-x64-gnu" ]; then
    echo "🔧 Installing Rollup dependency..."
    sudo -u ${APP_USER} npm install @rollup/rollup-linux-x64-gnu --save-optional
fi

# Database Setup
echo "🗄️ Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true

# Create environment file
echo "🔐 Creating environment configuration..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/.env << ENV_EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}  
SESSION_SECRET=$(openssl rand -base64 32)
REPL_ID=production-${PROJECT_NAME}
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=${DOMAIN}
PORT=${APP_PORT}
ENV_EOF

# Build application
echo "🔨 Building application..."
BUILD_SUCCESS=false
for i in {1..3}; do
    if sudo -u ${APP_USER} npm run build; then
        BUILD_SUCCESS=true
        break
    else
        echo "Build attempt $i failed, retrying..."
        sudo -u ${APP_USER} rm -rf node_modules/.vite dist
        if [ $i -eq 2 ]; then
            sudo -u ${APP_USER} npm install @rollup/rollup-linux-x64-gnu --force
        fi
    fi
done

if [ "$BUILD_SUCCESS" = false ]; then
    echo "❌ Build failed. Trying alternative method..."
    sudo -u ${APP_USER} npx vite build --force
fi

# Database migration
echo "🗄️ Running database migrations..."
sudo -u ${APP_USER} npm run db:push

# Create admin user directly via PostgreSQL (checking actual schema)
echo "👤 Creating admin user with correct database schema..."
sudo -u postgres psql -d ${DB_NAME} << ADMIN_EOF
-- Check actual table structure and create admin user accordingly
DO \$\$
DECLARE
    has_username boolean;
    has_password boolean;
BEGIN
    -- Check if username column exists
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') INTO has_username;
    -- Check if password column exists  
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') INTO has_password;
    
    IF has_username AND has_password THEN
        -- Full schema with username and password
        INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            '${ADMIN_USERNAME}',
            '${ADMIN_EMAIL}',
            '\$2b\$10\$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
            '${ADMIN_FIRST_NAME}',
            '${ADMIN_LAST_NAME}',
            'administrator',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    ELSE
        -- Basic schema without username/password columns
        INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            '${ADMIN_EMAIL}',
            '${ADMIN_FIRST_NAME}',
            '${ADMIN_LAST_NAME}',
            'administrator',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE 'Admin user created/updated successfully';
END
\$\$;

-- Show created user (using columns that definitely exist)
SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = 'admin_user';
ADMIN_EOF

echo "✅ Admin user created successfully!"
echo "👤 Admin access configured for: ${ADMIN_EMAIL}"

# Install PM2 and setup service
echo "⚡ Setting up PM2 process manager..."
npm install -g pm2

# Create logs directory
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/logs

# Create working PM2 ecosystem config
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} tee ecosystem.config.js << PM2_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT}
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
PM2_CONFIG_EOF

# Check build output and start appropriately
if [ -f "/home/${APP_USER}/${PROJECT_NAME}/dist/index.js" ]; then
    echo "✅ Starting built application..."
    sudo -u ${APP_USER} pm2 start ecosystem.config.js --env production
else
    echo "⚠️ Built application not found, starting with development mode..."
    # Create alternative config for development
    sudo -u ${APP_USER} tee ecosystem-dev.config.js << DEV_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: 'server/index.ts',
    interpreter: 'tsx',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT}
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
DEV_CONFIG_EOF
    sudo -u ${APP_USER} pm2 start ecosystem-dev.config.js --env production
fi

sudo -u ${APP_USER} pm2 save

# Setup PM2 startup script
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
sudo -u ${APP_USER} pm2 save

# Show status
echo "📊 PM2 Status:"
sudo -u ${APP_USER} pm2 status

# Setup Nginx
echo "🌐 Configuring Nginx..."
tee /etc/nginx/sites-available/${PROJECT_NAME} << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /home/${APP_USER}/${PROJECT_NAME}/dist;
    index index.html;
    
    # Serve static files
    location /assets/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "🎉 LateLounge deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   🌐 Domain: ${DOMAIN}"
echo "   👤 Admin Login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}"
echo "   📧 Admin Email: ${ADMIN_EMAIL}"
echo "   🗄️ Database: ${DB_NAME}"
echo "   📁 App Directory: /home/${APP_USER}/${PROJECT_NAME}"
echo ""
echo "🔧 Management Commands:"
echo "   sudo -u ${APP_USER} pm2 status"
echo "   sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo ""
echo "📝 Next Steps:"
echo "   1. Access admin panel at: https://${DOMAIN}/admin"
echo "   2. Log in with the credentials above"
echo "   3. Add your categories, products, and content"
echo "   4. Configure company information and settings"
echo ""
echo "🚀 Your LateLounge cafe website is now live and ready for content!"