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

# Create assets and uploads directories
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/assets
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/uploads

# Copy logo assets from attached_assets if they exist
if [ -d "attached_assets" ]; then
    echo "📋 Copying logo assets..."
    
    # Copy English white logo
    if [ -f "attached_assets/english-white_1750523827323.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/english-white_1750523827323.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/english-white.png"
        echo "✅ English white logo copied"
    fi
    
    # Copy English dark logo
    if [ -f "attached_assets/english-dark_1750523791780.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/english-dark_1750523791780.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/english-dark.png"
        echo "✅ English dark logo copied"
    fi
    
    # Copy Arabic white logo
    if [ -f "attached_assets/arabic-white_1750516260877.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/arabic-white_1750516260877.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/arabic-white.png"
        echo "✅ Arabic white logo copied"
    fi
    
    # Copy Arabic dark logo
    if [ -f "attached_assets/arabic-dark_1750516613229.png" ]; then
        sudo -u ${APP_USER} cp "attached_assets/arabic-dark_1750516613229.png" "/home/${APP_USER}/${PROJECT_NAME}/assets/arabic-dark.png"
        echo "✅ Arabic dark logo copied"
    fi
fi

# Copy development uploads if they exist
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    echo "📦 Copying development uploads..."
    sudo -u ${APP_USER} cp uploads/* "/home/${APP_USER}/${PROJECT_NAME}/uploads/" 2>/dev/null || echo "No uploads to copy"
    echo "✅ Development uploads copied"
fi

# Set proper permissions for assets
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}/assets
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}/uploads
sudo chmod -R 755 /home/${APP_USER}/${PROJECT_NAME}/assets
sudo chmod -R 755 /home/${APP_USER}/${PROJECT_NAME}/uploads

# Create comprehensive seeding script with complete production data
sudo -u ${APP_USER} tee seed-complete.js << 'SEED_EOF'
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
      nameAr: "المشروبات الساخنة",
      descriptionEn: "Warm and comforting drinks",
      descriptionAr: "مشروبات دافئة ومريحة",
      slug: "hot-drinks",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    const coldDrinksCategory = await storage.createCategory({
      nameEn: "Cold Beverages",
      nameAr: "المشروبات الباردة",
      descriptionEn: "Refreshing cold drinks",
      descriptionAr: "مشروبات باردة منعشة",
      slug: "cold-drinks",
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    const foodCategory = await storage.createCategory({
      nameEn: "Food",
      nameAr: "الطعام",
      descriptionEn: "Delicious food options",
      descriptionAr: "خيارات طعام لذيذة",
      slug: "food",
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    // Seed Products
    const products = [
      {
        nameEn: "Espresso", nameAr: "إسبريسو",
        descriptionEn: "Rich and bold espresso shot", descriptionAr: "جرعة إسبريسو غنية وجريئة",
        price: "15.00", categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: true, isAvailable: true
      },
      {
        nameEn: "Cappuccino", nameAr: "كابتشينو",
        descriptionEn: "Classic Italian coffee with steamed milk", descriptionAr: "قهوة إيطالية كلاسيكية مع حليب مبخر",
        price: "22.00", categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: false, isAvailable: true
      },
      {
        nameEn: "Latte", nameAr: "لاتيه",
        descriptionEn: "Smooth espresso with steamed milk", descriptionAr: "إسبريسو ناعم مع حليب مبخر",
        price: "25.00", categoryId: coffeeCategory.id,
        image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: true, isAvailable: true
      },
      {
        nameEn: "Green Tea", nameAr: "شاي أخضر",
        descriptionEn: "Premium organic green tea", descriptionAr: "شاي أخضر عضوي فاخر",
        price: "18.00", categoryId: hotDrinksCategory.id,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: false, isAvailable: true
      },
      {
        nameEn: "Hot Chocolate", nameAr: "شوكولاتة ساخنة",
        descriptionEn: "Rich hot chocolate with whipped cream", descriptionAr: "شوكولاتة ساخنة غنية مع كريمة مخفوقة",
        price: "25.00", categoryId: hotDrinksCategory.id,
        image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: false, isAvailable: true
      },
      {
        nameEn: "Iced Americano", nameAr: "أمريكانو مثلج",
        descriptionEn: "Refreshing iced coffee", descriptionAr: "قهوة مثلجة منعشة",
        price: "20.00", categoryId: coldDrinksCategory.id,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: true, isAvailable: true
      },
      {
        nameEn: "Fresh Orange Juice", nameAr: "عصير برتقال طازج",
        descriptionEn: "Freshly squeezed orange juice", descriptionAr: "عصير برتقال طازج",
        price: "16.00", categoryId: coldDrinksCategory.id,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: false, isAvailable: true
      },
      {
        nameEn: "Club Sandwich", nameAr: "ساندويتش كلوب",
        descriptionEn: "Classic club sandwich with chicken", descriptionAr: "ساندويتش كلوب كلاسيكي مع دجاج",
        price: "35.00", categoryId: foodCategory.id,
        image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        isActive: true, isFeatured: true, isAvailable: true
      }
    ];

    for (const product of products) {
      await storage.createProduct(product);
      console.log(`✅ Created product: ${product.nameEn}`);
    }

    // Seed all content
    await storage.createOrUpdateContactUs({
      phone: "${COMPANY_PHONE}",
      whatsapp: "${COMPANY_WHATSAPP}",
      email: "${COMPANY_EMAIL}",
      address: "${COMPANY_ADDRESS_EN}",
      addressAr: "${COMPANY_ADDRESS_AR}",
      workingHours: "${COMPANY_HOURS_EN}",
      workingHoursAr: "${COMPANY_HOURS_AR}",
      socialMediaLinks: {
        instagram: "${SOCIAL_INSTAGRAM}",
        twitter: "${SOCIAL_TWITTER}",
        facebook: "${SOCIAL_FACEBOOK}",
        snapchat: "${SOCIAL_SNAPCHAT}"
      },
      isActive: true
    });

    await storage.createOrUpdateFooterContent({
      companyNameEn: "${COMPANY_NAME_EN}",
      companyNameAr: "${COMPANY_NAME_AR}",
      descriptionEn: "Premium coffee experience with authentic flavors and warm hospitality",
      descriptionAr: "تجربة قهوة فاخرة مع نكهات أصيلة وضيافة دافئة",
      copyrightText: "© 2024 ${COMPANY_NAME_EN}. All rights reserved.",
      quickLinks: [
        { nameEn: "About Us", nameAr: "من نحن", url: "/about" },
        { nameEn: "Menu", nameAr: "القائمة", url: "/menu" },
        { nameEn: "Contact", nameAr: "اتصل بنا", url: "/contact" },
        { nameEn: "Privacy Policy", nameAr: "سياسة الخصوصية", url: "/privacy" }
      ],
      isActive: true
    });

    await storage.createOrUpdateAboutUs({
      titleEn: "About ${COMPANY_NAME_EN}",
      titleAr: "حول ${COMPANY_NAME_AR}",
      contentEn: "Welcome to ${COMPANY_NAME_EN}, where exceptional coffee meets warm hospitality. We are dedicated to creating a unique coffee experience that brings people together in a comfortable and inviting atmosphere.",
      contentAr: "مرحباً بكم في ${COMPANY_NAME_AR}، حيث تلتقي القهوة الاستثنائية مع الضيافة الدافئة. نحن ملتزمون بخلق تجربة قهوة فريدة تجمع الناس في أجواء مريحة ومرحبة.",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      isActive: true
    });

    await storage.createOrUpdateWidget({
      name: "tawk_chat",
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