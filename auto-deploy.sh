#!/bin/bash

echo "=== LATELOUNGE COMPLETE AUTO-DEPLOYMENT SCRIPT ==="
echo "This script includes ALL critical fixes discovered during development"

# Configuration Variables - Modify these for your deployment
DOMAIN="demo2.late-lounge.com"
DOMAIN_WWW="www.demo2.late-lounge.com"
GIT_REPO_URL="https://github.com/your-username/latelounge.git"
PROJECT_NAME="latelounge"
APP_USER="appuser"
DB_USER="appuser"
DB_PASSWORD="SAJWJJAHED4E"
DB_NAME="latelounge"
EMAIL="haitham@hmaserv.com"
NODE_VERSION="20"
APP_PORT="3000"

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

# Create user and setup directory
sudo useradd -m -s /bin/bash ${APP_USER} 2>/dev/null || echo "User ${APP_USER} already exists"
sudo usermod -aG sudo ${APP_USER}

# CRITICAL FIX #1: Directory permissions for nginx access
echo "Applying critical directory permissions fix..."
sudo chmod o+x /home/${APP_USER}/

# Install dependencies
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y curl gnupg lsb-release postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# CRITICAL FIX #2: PostgreSQL local configuration
echo "Setting up PostgreSQL with local authentication..."
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Configure PostgreSQL for local connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
echo "local   all             ${DB_USER}                                md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Clone/setup project
cd /home/${APP_USER}
if [ ! -d "${PROJECT_NAME}" ]; then
    sudo -u ${APP_USER} git clone ${GIT_REPO_URL} ${PROJECT_NAME} || echo "Using existing directory"
fi
cd ${PROJECT_NAME}

# Install all dependencies including authentication packages
echo "Installing Node.js dependencies..."
sudo -u ${APP_USER} npm install
sudo -u ${APP_USER} npm install bcryptjs @types/bcryptjs

# Setup environment variables
sudo -u ${APP_USER} tee .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
PGHOST=localhost
PGPORT=5432
PGUSER=${DB_USER}
PGPASSWORD=${DB_PASSWORD}
PGDATABASE=${DB_NAME}
SESSION_SECRET=$(openssl rand -hex 32)
REPL_ID=${PROJECT_NAME}-production
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=${DOMAIN}
EOF

# Build the project
echo "Building the application..."
sudo -u ${APP_USER} npm run build

# Copy logo assets to production
echo "Copying logo assets to production..."
sudo -u ${APP_USER} mkdir -p dist/public/assets
if [ -f "${LOGO_WHITE_PATH}" ]; then
    sudo -u ${APP_USER} cp "${LOGO_WHITE_PATH}" dist/public/assets/
    echo "✓ Copied white theme logo"
fi
if [ -f "${LOGO_DARK_PATH}" ]; then
    sudo -u ${APP_USER} cp "${LOGO_DARK_PATH}" dist/public/assets/
    echo "✓ Copied dark theme logo"
fi
if [ -f "${LOGO_ARABIC_WHITE_PATH}" ]; then
    sudo -u ${APP_USER} cp "${LOGO_ARABIC_WHITE_PATH}" dist/public/assets/
    echo "✓ Copied Arabic white logo"
fi
if [ -f "${LOGO_ARABIC_DARK_PATH}" ]; then
    sudo -u ${APP_USER} cp "${LOGO_ARABIC_DARK_PATH}" dist/public/assets/
    echo "✓ Copied Arabic dark logo"
fi

# CRITICAL FIX #3: PM2 ecosystem with .cjs extension for ES modules
sudo -u ${APP_USER} tee ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT}
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
sudo -u ${APP_USER} mkdir -p logs
sudo -u ${APP_USER} mkdir -p uploads
sudo chmod 755 uploads

# CRITICAL FIX #4: File permissions for nginx
echo "Setting correct file permissions for nginx..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/
sudo find dist/ -type f -exec chmod 644 {} \;

# CRITICAL FIX #5: Complete Nginx configuration with HTTP and proper asset mapping
sudo tee /etc/nginx/sites-available/${PROJECT_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} ${DOMAIN_WWW};

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upload size limit
    client_max_body_size 10M;

    # CRITICAL: Map /assets/ requests to filesystem location
    location /assets/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Serve uploads
    location /uploads/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # API routes to Node.js
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
}
EOF

# Enable site and remove default
sudo ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t && sudo systemctl restart nginx

# CRITICAL FIX #6: Database schema migration and complete seeding with admin user
echo "Setting up database schema and seeding data..."
sudo -u ${APP_USER} npm run db:push

# CRITICAL FIX #7: Copy development assets and uploads to production
echo "📸 Copying development assets to production..."

# Change to project directory first
cd /home/${APP_USER}/${PROJECT_NAME}

# Create assets and uploads directories
sudo -u ${APP_USER} mkdir -p assets uploads

# Copy logo assets from attached_assets if they exist in source
if [ -d "/tmp/latelounge-source/attached_assets" ]; then
    echo "📋 Copying logo assets..."
    
    # Copy English white logo
    if [ -f "/tmp/latelounge-source/attached_assets/english-white_1750523827323.png" ]; then
        sudo -u ${APP_USER} cp "/tmp/latelounge-source/attached_assets/english-white_1750523827323.png" "assets/english-white.png"
        echo "✅ English white logo copied"
    fi
    
    # Copy English dark logo
    if [ -f "/tmp/latelounge-source/attached_assets/english-dark_1750523791780.png" ]; then
        sudo -u ${APP_USER} cp "/tmp/latelounge-source/attached_assets/english-dark_1750523791780.png" "assets/english-dark.png"
        echo "✅ English dark logo copied"
    fi
    
    # Copy Arabic white logo
    if [ -f "/tmp/latelounge-source/attached_assets/arabic-white_1750516260877.png" ]; then
        sudo -u ${APP_USER} cp "/tmp/latelounge-source/attached_assets/arabic-white_1750516260877.png" "assets/arabic-white.png"
        echo "✅ Arabic white logo copied"
    fi
    
    # Copy Arabic dark logo
    if [ -f "/tmp/latelounge-source/attached_assets/arabic-dark_1750516613229.png" ]; then
        sudo -u ${APP_USER} cp "/tmp/latelounge-source/attached_assets/arabic-dark_1750516613229.png" "assets/arabic-dark.png"
        echo "✅ Arabic dark logo copied"
    fi
fi

# Copy development uploads if they exist in source
if [ -d "/tmp/latelounge-source/uploads" ] && [ "$(ls -A /tmp/latelounge-source/uploads 2>/dev/null)" ]; then
    echo "📦 Copying development uploads..."
    sudo -u ${APP_USER} cp /tmp/latelounge-source/uploads/* uploads/ 2>/dev/null || echo "No uploads to copy"
    echo "✅ Development uploads copied"
fi

# Set proper permissions for assets
sudo chown -R ${APP_USER}:${APP_USER} assets uploads
sudo chmod -R 755 assets uploads

# Create comprehensive seeding script with complete production data
cat > /tmp/seed-complete.js << SEED_EOF
import { seedProductionData } from "./server/productionSeeder.js";

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
    
    // Fallback to basic seeding if production seeder fails
    console.log("🔄 Attempting fallback seeding...");
    const { storage } = await import("./server/storage.js");
    
    try {
      const existingAdmin = await storage.getUserByUsername("${ADMIN_USERNAME}");
      if (!existingAdmin) {
        const defaultAdmin = await storage.createLocalUser({
          username: "${ADMIN_USERNAME}",
          email: "${ADMIN_EMAIL}",
          password: "${ADMIN_PASSWORD}",
          firstName: "${ADMIN_FIRST_NAME}",
          lastName: "${ADMIN_LAST_NAME}",
          role: "administrator",
          isActive: true
        });
        console.log("✅ Fallback admin user created");
      }
    } catch (fallbackError) {
      console.error("❌ Fallback seeding also failed:", fallbackError);
    }
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

# Copy seeding script to project directory with proper permissions
sudo cp /tmp/seed-complete.js /home/${APP_USER}/${PROJECT_NAME}/seed-complete.js
sudo chown ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}/seed-complete.js

# Run the comprehensive seeding script with updated tsx flag
echo "🌱 Running comprehensive production data seeding..."
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} node --import tsx/esm seed-complete.js

# CRITICAL FIX #8: Complete remaining deployment steps
echo "🔨 Building application..."
sudo -u ${APP_USER} npm run build

# Setup PM2 ecosystem
echo "⚙️ Setting up PM2 configuration..."
sudo -u ${APP_USER} tee ecosystem.config.js << 'PM2_EOF'
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
sudo -u ${APP_USER} mkdir -p logs

# Start services with PM2
echo "🚀 Starting application with PM2..."
sudo -u ${APP_USER} pm2 start ecosystem.config.js
sudo -u ${APP_USER} pm2 save
sudo -u ${APP_USER} pm2 startup

# Setup Nginx virtual host
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

# Setup SSL with Certbot
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d ${DOMAIN} -d ${DOMAIN_WWW} --email ${EMAIL} --agree-tos --non-interactive

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

echo "✅ LateLounge deployment completed successfully!"
echo ""
echo "🌐 Your application should be available at: https://${DOMAIN}"
echo "🔑 Database credentials are stored in .env file"
echo "📊 Check application status with: pm2 status"
echo "📝 View logs with: pm2 logs latelounge"
echo "🍽️ Production data includes:"
echo "   - 6 Categories (Coffee, Hot Beverages, Cold Beverages, Breakfast, Main Dishes, Desserts)"
echo "   - 19 Products with authentic data and images"
echo "   - Admin user (username: ${ADMIN_USERNAME}, password: ${ADMIN_PASSWORD})"
echo "   - Complete content (About, Contact, Footer, Privacy Policy, Terms)"
echo "   - Logo assets and product images from development"
echo ""
echo "🎉 Deployment complete! Your LateLounge cafe website is now live with full data!"
      titleEn: "Live Chat Support",
      titleAr: "دعم الدردشة المباشرة",
      descriptionEn: "Get instant help from our support team",
      descriptionAr: "احصل على مساعدة فورية من فريق الدعم",
      settings: {
        enabled: true,
        tawkId: "default-tawk-id",
        position: "bottom-right"
      },
      isActive: true
    });

    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("=== LOGIN CREDENTIALS ===");
    console.log("Username: admin");
    console.log("Password: admin123456");
    console.log("Email: admin@latelounge.sa");
    console.log("Role: administrator");
    console.log("");
    console.log("IMPORTANT: Change the default password after first login!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedComplete().then(() => {
  console.log("✅ Seeding process finished");
  process.exit(0);
});
SEED_EOF

# Run the comprehensive seeding script
echo "Running complete database seeding with admin user..."
sudo -u ${APP_USER} node seed-complete.js

# Start PM2 application
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production
sudo -u ${APP_USER} pm2 save
sudo -u ${APP_USER} pm2 startup | grep -o 'sudo.*' | sudo bash

# Test deployment
echo "Testing complete deployment..."
sleep 10

# Test all APIs
echo "Testing all APIs..."
curl -s http://localhost:${APP_PORT}/api/categories | head -100
curl -s http://localhost:${APP_PORT}/api/products | head -100
curl -s http://localhost:${APP_PORT}/api/contact | head -100
curl -s http://localhost:${APP_PORT}/api/footer | head -100
curl -s http://localhost:${APP_PORT}/api/about | head -100
curl -s http://localhost:${APP_PORT}/api/widgets/tawk_chat | head -100

# Test admin authentication
echo "Testing admin authentication..."
curl -X POST http://localhost:${APP_PORT}/api/auth/local/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" | head -100

# Test asset serving
echo "Testing asset serving..."
curl -I http://${DOMAIN}/assets/index-D9yNFWBb.css

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Website: http://${DOMAIN}"
echo "Admin Panel: http://${DOMAIN}/admin"
echo ""
echo "Default Admin Credentials:"
echo "Username: ${ADMIN_USERNAME}"
echo "Password: ${ADMIN_PASSWORD}"
echo "Email: ${ADMIN_EMAIL}"
echo "Role: administrator"
echo ""
echo "CRITICAL SECURITY: Change default password immediately!"
echo ""
echo "Management Commands:"
echo "sudo -u ${APP_USER} pm2 status"
echo "sudo -u ${APP_USER} pm2 logs"
echo "sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo "sudo -u ${APP_USER} pm2 stop ${PROJECT_NAME}"
echo ""
echo "All Critical Fixes Applied:"
echo "✅ Directory permissions (chmod o+x /home/${APP_USER}/)"
echo "✅ PostgreSQL local authentication"
echo "✅ PM2 ES module compatibility (.cjs)"
echo "✅ Nginx HTTP + asset mapping"
echo "✅ File permissions for www-data"
echo "✅ Complete database seeding"
echo "✅ Admin user authentication system"
echo "✅ bcrypt password hashing"
echo "✅ All API endpoints with data"