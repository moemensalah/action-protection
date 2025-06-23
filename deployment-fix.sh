#!/bin/bash

# LateLounge Production Deployment Script - Permission Fixed Version
# This script addresses all permission and compatibility issues

set -e

echo "=== LATELOUNGE DEPLOYMENT WITH PERMISSION FIXES ==="

# Configuration Variables
DOMAIN="demo2.late-lounge.com"
DOMAIN_WWW="www.demo2.late-lounge.com"
PROJECT_NAME="latelounge"
APP_USER="appuser"
DB_USER="appuser"
DB_PASSWORD="SAJWJJAHED4E"
DB_NAME="latelounge"
EMAIL="haitham@hmaserv.com"
APP_PORT="3000"

# Admin User Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"
ADMIN_EMAIL="admin@latelounge.sa"

# CRITICAL FIX #1: Ensure proper user and directory setup
echo "🔧 Setting up user and directories with proper permissions..."
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $APP_USER
fi

# Create project directory with proper ownership from start
sudo mkdir -p /home/${APP_USER}/${PROJECT_NAME}
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}
sudo chmod -R 755 /home/${APP_USER}

# CRITICAL FIX #2: Deploy source code with immediate ownership fix
echo "📦 Deploying source code with proper permissions..."
sudo mkdir -p /tmp/deployment-staging
sudo cp -r . /tmp/deployment-staging/
sudo chown -R ${APP_USER}:${APP_USER} /tmp/deployment-staging/
sudo -u ${APP_USER} cp -r /tmp/deployment-staging/* /home/${APP_USER}/${PROJECT_NAME}/

# Ensure all TypeScript files are copied properly
sudo -u ${APP_USER} cp -f server/productionSeeder.ts /home/${APP_USER}/${PROJECT_NAME}/server/ 2>/dev/null || true
sudo -u ${APP_USER} cp -f shared/schema.ts /home/${APP_USER}/${PROJECT_NAME}/shared/ 2>/dev/null || true

cd /home/${APP_USER}/${PROJECT_NAME}

# CRITICAL FIX #3: Fix npm and Node.js permissions before installation
echo "🔧 Fixing npm permissions and cache..."
sudo mkdir -p /home/${APP_USER}/.npm
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/.npm
sudo chmod -R 755 /home/${APP_USER}/.npm

# Clear any problematic cache
sudo -u ${APP_USER} npm cache clean --force

# CRITICAL FIX #4: Install dependencies with proper user context and handle Rollup issue
echo "📦 Installing Node.js dependencies..."
sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && rm -rf node_modules package-lock.json'
sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && npm install'

# Fix Rollup optional dependency issue if it occurs
if [ ! -d "/home/${APP_USER}/${PROJECT_NAME}/node_modules/@rollup/rollup-linux-x64-gnu" ]; then
    echo "🔧 Fixing Rollup optional dependency issue..."
    sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && npm install @rollup/rollup-linux-x64-gnu --save-optional'
fi

# CRITICAL FIX #5: Create environment file with proper permissions
echo "🔐 Setting up environment variables..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/.env << ENV_EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
PGHOST=localhost
PGPORT=5432
PGUSER=${DB_USER}
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=${DB_NAME}
SESSION_SECRET=$(openssl rand -hex 32)
REPL_ID=latelounge-production
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=${DOMAIN}
ENV_EOF

# CRITICAL FIX #6: Build application with proper permissions and fallback handling
echo "🔨 Building application..."
cd /home/${APP_USER}/${PROJECT_NAME}

# Try building with retries for Rollup issues
BUILD_SUCCESS=false
for i in {1..3}; do
    if sudo -u ${APP_USER} npm run build; then
        BUILD_SUCCESS=true
        break
    else
        echo "Build attempt $i failed, cleaning and retrying..."
        sudo -u ${APP_USER} rm -rf node_modules/.vite
        sudo -u ${APP_USER} rm -rf dist
        if [ $i -eq 2 ]; then
            echo "Reinstalling dependencies for final build attempt..."
            sudo -u ${APP_USER} npm install @rollup/rollup-linux-x64-gnu --force
        fi
    fi
done

if [ "$BUILD_SUCCESS" = false ]; then
    echo "❌ Build failed after multiple attempts. Trying alternative build method..."
    sudo -u ${APP_USER} npx vite build --force
fi

# CRITICAL FIX #7: Create asset directories with proper structure
echo "📸 Setting up assets and uploads..."
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/assets
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/uploads
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/dist/public/assets

# Copy logo assets if they exist
if [ -d "attached_assets" ]; then
    echo "📋 Copying logo assets..."
    
    if [ -f "attached_assets/english-white_1750523827323.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/english-white_1750523827323.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/english-white.png"
        sudo -u ${APP_USER} cp "attached_assets/english-white_1750523827323.png" "/home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/english-white.png"
    fi
    
    if [ -f "attached_assets/english-dark_1750523791780.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/english-dark_1750523791780.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/english-dark.png"
        sudo -u ${APP_USER} cp "attached_assets/english-dark_1750523791780.png" "/home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/english-dark.png"
    fi
    
    if [ -f "attached_assets/arabic-white_1750516260877.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/arabic-white_1750516260877.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/arabic-white.png"
        sudo -u ${APP_USER} cp "attached_assets/arabic-white_1750516260877.png" "/home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/arabic-white.png"
    fi
    
    if [ -f "attached_assets/arabic-dark_1750516613229.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/arabic-dark_1750516613229.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/arabic-dark.png"
        sudo -u ${APP_USER} cp "attached_assets/arabic-dark_1750516613229.png" "/home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/arabic-dark.png"
    fi
fi

# Copy development uploads if they exist
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    sudo -u ${APP_USER} cp uploads/* "/home/${APP_USER}/${PROJECT_NAME}/uploads/" 2>/dev/null || true
fi

# CRITICAL FIX #8: Database migration
echo "🗄️ Running database migrations..."
sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && npm run db:push'

# CRITICAL FIX #9: Create comprehensive seeding script with proper permissions
echo "🌱 Setting up production data seeding..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/seed-production.js << 'SEED_EOF'
import { seedProductionData } from "./server/productionSeeder.ts";

async function seedComplete() {
  console.log("🌱 Starting comprehensive production data seeding...");

  try {
    await seedProductionData();
    console.log("✅ Production data seeded successfully!");
    console.log("📊 Seeded data includes:");
    console.log("   - 6 Categories with authentic content");
    console.log("   - 19 Products with real descriptions and images");
    console.log("   - Admin user (username: admin, password: admin123)");
    console.log("   - Complete website content (About, Contact, Footer)");
    console.log("   - Privacy Policy and Terms of Service");
    console.log("   - Widget settings and logos");
    
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seedComplete().then(() => {
  console.log("🎉 Database seeding completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Fatal seeding error:", error);
  process.exit(1);
});
SEED_EOF

# Run seeding with correct tsx flag
echo "🌱 Running production data seeding..."
sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && node --import tsx/esm seed-production.js'

# CRITICAL FIX #10: PM2 ecosystem with proper permissions
echo "⚙️ Setting up PM2 configuration..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'server/production.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx/esm',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
PM2_EOF

# Create logs directory
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/logs

# CRITICAL FIX #11: Nginx configuration with correct paths
echo "🌐 Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/${PROJECT_NAME} << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN} ${DOMAIN_WWW};

    root /home/${APP_USER}/${PROJECT_NAME};
    index index.html;

    # Serve static files
    location /assets/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }

    location /uploads/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Everything else to Node.js
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Handle large file uploads
    client_max_body_size 10M;
}
NGINX_EOF

# Enable site and remove default
sudo ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx

# CRITICAL FIX #12: Start application with PM2
echo "🚀 Starting application with PM2..."
sudo -u ${APP_USER} bash -c 'cd /home/'"${APP_USER}"'/'"${PROJECT_NAME}"' && pm2 start ecosystem.config.js'
sudo -u ${APP_USER} pm2 save
sudo -u ${APP_USER} pm2 startup

# Setup SSL if certbot is available
if command -v certbot &> /dev/null; then
    echo "🔒 Setting up SSL certificate..."
    sudo certbot --nginx -d ${DOMAIN} -d ${DOMAIN_WWW} --email ${EMAIL} --agree-tos --non-interactive
fi

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

echo "✅ LateLounge deployment completed successfully!"
echo ""
echo "🌐 Your application should be available at: http://${DOMAIN}"
echo "🔑 Admin credentials: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}"
echo "📊 Check application status with: sudo -u ${APP_USER} pm2 status"
echo "📝 View logs with: sudo -u ${APP_USER} pm2 logs latelounge"
echo ""
echo "🎉 Deployment complete with all permission fixes applied!"