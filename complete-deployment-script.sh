#!/bin/bash

# Complete LateLounge Production Deployment Script
# Fixes all permission, build, and seeding issues

set -e

# Configuration
PROJECT_NAME="latelounge"
APP_USER="appuser"
DOMAIN="your-domain.com"  # Update this with your actual domain
DB_NAME="latelounge_prod"
DB_USER="latelounge_user"
DB_PASS=$(openssl rand -base64 32)

echo "🚀 Starting LateLounge Production Deployment..."

# System Setup
echo "⚙️ Setting up system dependencies..."
apt update
apt install -y nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx

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
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true

# Create environment file
echo "🔐 Creating environment configuration..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/.env << ENV_EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
SESSION_SECRET=$(openssl rand -base64 32)
REPL_ID=production-${PROJECT_NAME}
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=${DOMAIN}
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

# Create production seeder with inline data
echo "🌱 Creating production seeder..."
sudo -u ${APP_USER} tee /home/${APP_USER}/${PROJECT_NAME}/seed-production.js << 'SEED_EOF'
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedProductionData() {
  const client = await pool.connect();
  
  try {
    console.log("🌱 Starting production data seeding...");

    // Seed Admin User
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await client.query(`
      INSERT INTO users (id, username, email, password, "firstName", "lastName", role, "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, ["admin_prod", "admin", "admin@latelounge.sa", hashedPassword, "System", "Administrator", "administrator", true]);

    // Seed Categories
    console.log("📂 Creating categories...");
    const categories = [
      ["Coffee & Espresso", "القهوة والإسبريسو", "Premium coffee blends", "خلطات قهوة فاخرة", "coffee", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600", 1],
      ["Hot Beverages", "المشروبات الساخنة", "Warm drinks", "مشروبات دافئة", "hot-drinks", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600", 2],
      ["Cold Beverages", "المشروبات الباردة", "Refreshing cold drinks", "مشروبات باردة منعشة", "cold-drinks", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600", 3],
      ["Breakfast", "الإفطار", "Fresh breakfast options", "خيارات إفطار طازجة", "breakfast", "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600", 4],
      ["Main Dishes", "الأطباق الرئيسية", "Hearty meals", "وجبات شهية", "main-dishes", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600", 5],
      ["Desserts", "الحلويات", "Sweet treats", "حلويات حلوة", "desserts", "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600", 6]
    ];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      await client.query(`
        INSERT INTO categories ("nameEn", "nameAr", "descriptionEn", "descriptionAr", slug, image, "sortOrder", "isActive")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO NOTHING
      `, [...cat, true]);
    }

    // Seed Products
    console.log("🍽️ Creating products...");
    const products = [
      ["Espresso", "إسبريسو", "Rich espresso shot", "جرعة إسبريسو غنية", "15.00", 1, "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=400", 1],
      ["Latte", "لاتيه", "Smooth espresso with milk", "إسبريسو ناعم مع حليب", "25.00", 1, "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&h=400", 2],
      ["Cappuccino", "كابتشينو", "Classic cappuccino", "كابتشينو كلاسيكي", "22.00", 1, "https://images.unsplash.com/photo-1572286258217-c4915328b391?w=600&h=400", 3],
      ["Turkish Coffee", "قهوة تركية", "Traditional Turkish coffee", "قهوة تركية تقليدية", "18.00", 2, "https://images.unsplash.com/photo-1544279029-5b0b3e91b4d8?w=600&h=400", 1],
      ["Hot Chocolate", "شوكولاتة ساخنة", "Rich hot chocolate", "شوكولاتة ساخنة غنية", "20.00", 2, "https://images.unsplash.com/photo-1542990253-a781e04c0082?w=600&h=400", 2],
      ["Iced Coffee", "قهوة مثلجة", "Refreshing iced coffee", "قهوة مثلجة منعشة", "23.00", 3, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&h=400", 1],
      ["Fresh Juice", "عصير طازج", "Fresh fruit juice", "عصير فواكه طازج", "15.00", 3, "https://images.unsplash.com/photo-1514995669114-6081e934b693?w=600&h=400", 2]
    ];

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      await client.query(`
        INSERT INTO products ("nameEn", "nameAr", "descriptionEn", "descriptionAr", price, "categoryId", image, "sortOrder", stock, "isActive", "isFeatured", "isAvailable")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [...prod, 100, true, true, true]);
    }

    // Seed About Us
    await client.query(`
      INSERT INTO about_us ("titleEn", "titleAr", "contentEn", "contentAr", "isActive")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET "titleEn" = $1, "titleAr" = $2, "contentEn" = $3, "contentAr" = $4
    `, [
      "About LateLounge",
      "حول ليت لاونج", 
      "Welcome to LateLounge, where exceptional coffee meets warm hospitality. We serve premium beverages and delicious food in a cozy atmosphere.",
      "مرحباً بكم في ليت لاونج، حيث تلتقي القهوة الاستثنائية بالضيافة الدافئة. نقدم مشروبات فاخرة وطعام لذيذ في أجواء مريحة.",
      true
    ]);

    // Seed Contact Us
    await client.query(`
      INSERT INTO contact_us (phone, whatsapp, email, address, "addressAr", "workingHours", "workingHoursAr", "socialMediaLinks", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET phone = $1, whatsapp = $2, email = $3
    `, [
      "+966 11 555 1234",
      "966555555555",
      "contact@latelounge.sa",
      "456 Coffee Street, Riyadh",
      "456 شارع القهوة، الرياض",
      "Daily: 6AM-12AM",
      "يومياً: 6ص-12م",
      JSON.stringify({
        twitter: "https://twitter.com/latelounge_sa",
        facebook: "https://facebook.com/latelounge",
        instagram: "https://instagram.com/latelounge_sa"
      }),
      true
    ]);

    console.log("✅ Production data seeded successfully!");
    
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    client.release();
  }
}

seedProductionData().then(() => {
  console.log("🎉 Database seeding completed!");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
SEED_EOF

# Run seeding
echo "🌱 Seeding production data..."
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME} node seed-production.js

# Install PM2 and setup service
echo "⚡ Setting up PM2 process manager..."
npm install -g pm2
sudo -u ${APP_USER} pm2 start ecosystem.config.js --env production
sudo -u ${APP_USER} pm2 save
sudo -u ${APP_USER} pm2 startup

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
echo "   👤 Admin Login: admin / admin123"
echo "   🗄️ Database: ${DB_NAME}"
echo "   📁 App Directory: /home/${APP_USER}/${PROJECT_NAME}"
echo ""
echo "🔧 Management Commands:"
echo "   sudo -u ${APP_USER} pm2 status"
echo "   sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo ""
echo "🚀 Your LateLounge cafe website is now live!"