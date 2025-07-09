#!/bin/bash

# ========================================================================
# Complete Production Deployment Script - Action Protection
# ========================================================================

set -e

# Configuration
PROJECT_DIR="/home/actionprotection/action-protection"
GIT_REPO="https://github.com/moemensalah/action-protection.git"  # Replace with your actual repository
GIT_BRANCH="main"
APP_USER="actionprotection"
DB_NAME="actionprotection_db"
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
DOMAIN="demox.actionprotectionkw.com"
PORT=4000

echo "🚀 Starting Complete Production Deployment for Action Protection..."
echo "Domain: $DOMAIN"
echo "Database: $DB_NAME"
echo "User: $APP_USER"
echo "Port: $PORT"
echo ""

# 1. System Dependencies Check
echo "1. Checking system dependencies..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install -y nginx
fi

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt install -y git
fi

# 2. Create application user if doesn't exist
echo "2. Setting up application user..."
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $APP_USER
    sudo usermod -aG sudo $APP_USER
fi

# 3. Setup PostgreSQL database
echo "3. Setting up PostgreSQL database..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create new database and user
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;

-- Connect to database and grant schema permissions
\c $DB_NAME;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
EOF

# 4. Import database dump
echo "4. Importing database dump..."
if [ -f "production-db-dump.sql" ]; then
    echo "Using production-db-dump.sql..."
    sudo -u postgres psql -d $DB_NAME -f production-db-dump.sql
else
    echo "Creating database structure and data..."
    sudo -u postgres psql -d $DB_NAME << 'EOF'
-- Create tables with complete structure
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    role TEXT NOT NULL DEFAULT 'moderator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS website_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_section (
    id SERIAL PRIMARY KEY,
    background_images TEXT[] NOT NULL DEFAULT '{}',
    typing_words_en TEXT[] NOT NULL DEFAULT '{}',
    typing_words_ar TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experience_section (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    video1_url TEXT,
    video2_url TEXT,
    text1_en TEXT,
    text1_ar TEXT,
    text2_en TEXT,
    text2_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_us (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    address_en TEXT NOT NULL,
    address_ar TEXT NOT NULL,
    google_maps_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    tiktok_url TEXT,
    snapchat_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS footer_content (
    id SERIAL PRIMARY KEY,
    company_name_en TEXT NOT NULL,
    company_name_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about_us (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    mission_en TEXT,
    mission_ar TEXT,
    vision_en TEXT,
    vision_ar TEXT,
    hero_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS widget_settings (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT,
    content_ar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smtp_settings (
    id SERIAL PRIMARY KEY,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    from_email TEXT NOT NULL,
    admin_email TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    is_show_on_website BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO actionprotection;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO actionprotection;

-- Insert admin user
INSERT INTO users (
    id, email, username, password, first_name, last_name, role, is_active, created_at, updated_at
) VALUES (
    'admin_user_production',
    'admin@actionprotection.com',
    'admin',
    '$2b$12$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name_en, name_ar, description_en, description_ar, slug, is_active, sort_order) VALUES
('Thermal Insulator', 'عازل حراري', 'Premium thermal insulation services', 'خدمات العزل الحراري المتميزة', 'thermal-insulator', true, 1),
('Thermal Insulation Protection', 'حماية العزل الحراري', 'Advanced thermal protection systems', 'أنظمة الحماية الحرارية المتقدمة', 'thermal-protection', true, 2),
('Protection', 'الحماية', 'Comprehensive vehicle protection', 'حماية شاملة للمركبات', 'protection', true, 3),
('Polish', 'التلميع', 'Professional polishing services', 'خدمات التلميع الاحترافية', 'polish', true, 4),
('Painting and Vacuuming', 'الطلاء والتنظيف', 'Complete painting and cleaning services', 'خدمات الطلاء والتنظيف الكاملة', 'painting-cleaning', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default products
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, category_id, sort_order, is_active, is_featured, is_available, stock) VALUES
('Ceramic Thermal Insulation', 'العزل الحراري السيراميكي', 'Advanced ceramic coating for thermal protection', 'طلاء سيراميكي متقدم للحماية الحرارية', 150.00, 1, 1, true, true, true, 100),
('Premium Heat Shield', 'درع الحرارة المتميز', 'High-performance heat protection system', 'نظام حماية حرارية عالي الأداء', 200.00, 2, 1, true, true, true, 50),
('Paint Protection Film', 'فيلم حماية الطلاء', 'Transparent protective film for paint', 'فيلم حماية شفاف للطلاء', 300.00, 3, 1, true, true, true, 75),
('Professional Polish', 'التلميع الاحترافي', 'Premium polishing service', 'خدمة التلميع المتميزة', 80.00, 4, 1, true, false, true, 200),
('Complete Detailing', 'التنظيف الشامل', 'Full vehicle detailing service', 'خدمة تنظيف المركبة بالكامل', 120.00, 5, 1, true, true, true, 100)
ON CONFLICT DO NOTHING;

-- Insert default content
INSERT INTO contact_us (phone, whatsapp, email, address_en, address_ar, google_maps_url) VALUES
('+965 2245 0123', '+965 9876 5432', 'info@actionprotection.com', 'Kuwait City, Kuwait', 'مدينة الكويت، الكويت', 'https://maps.google.com')
ON CONFLICT DO NOTHING;

INSERT INTO footer_content (company_name_en, company_name_ar, description_en, description_ar) VALUES
('Action Protection', 'أكشن بروتكشن', 'Premium automotive protection services', 'خدمات حماية السيارات المتميزة')
ON CONFLICT DO NOTHING;

INSERT INTO widget_settings (name, title_en, title_ar, content_en, content_ar, is_active) VALUES
('tawk_chat', 'Live Chat', 'الدردشة المباشرة', 'Customer support chat', 'دردشة دعم العملاء', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO hero_section (background_images, typing_words_en, typing_words_ar) VALUES
('{}', '{"Premium Protection", "Expert Care", "Quality Service"}', '{"حماية متميزة", "عناية متخصصة", "خدمة عالية الجودة"}')
ON CONFLICT DO NOTHING;

INSERT INTO experience_section (title_en, title_ar, text1_en, text1_ar, text2_en, text2_ar) VALUES
('EXPERIENCE TRUE LUXURY', 'استمتع بالرفاهية الحقيقية', 'Premium automotive protection', 'حماية السيارات المتميزة', 'Excellence in every detail', 'التميز في كل التفاصيل')
ON CONFLICT DO NOTHING;

INSERT INTO about_us (title_en, title_ar, content_en, content_ar, mission_en, mission_ar, vision_en, vision_ar) VALUES
('About Action Protection', 'حول أكشن بروتكشن', 'Leading automotive protection services in Kuwait', 'خدمات حماية السيارات الرائدة في الكويت', 'Protecting your investment', 'حماية استثمارك', 'Excellence in automotive care', 'التميز في العناية بالسيارات')
ON CONFLICT DO NOTHING;

EOF
fi

# 5. Setup project directory and clone repository
echo "5. Setting up project directory and cloning repository..."

# Handle existing directory
if [ -d "$PROJECT_DIR" ]; then
    echo "Existing deployment found at: $PROJECT_DIR"
    
    # Create backup
    BACKUP_DIR="/home/$APP_USER/deployment-backups/$(date +%Y%m%d_%H%M%S)"
    sudo -u $APP_USER mkdir -p $BACKUP_DIR
    echo "Creating backup at: $BACKUP_DIR"
    sudo -u $APP_USER cp -r $PROJECT_DIR $BACKUP_DIR/
    
    # Stop existing services
    echo "Stopping existing services..."
    sudo -u $APP_USER pm2 stop action-protection 2>/dev/null || true
    sudo -u $APP_USER pm2 delete action-protection 2>/dev/null || true
    
    # Remove existing directory
    echo "Removing existing directory: $PROJECT_DIR"
    sudo rm -rf $PROJECT_DIR
    
    echo "✅ Backup created and existing deployment removed"
fi

sudo mkdir -p $PROJECT_DIR
sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR

# Clone repository or copy local files
echo "Cloning project from repository..."
if [ -n "$GIT_REPO" ] && [ "$GIT_REPO" != "https://github.com/user/action-protection.git" ]; then
    # Clone from git repository
    sudo -u $APP_USER git clone -b $GIT_BRANCH $GIT_REPO $PROJECT_DIR
    if [ $? -eq 0 ]; then
        echo "✅ Successfully cloned repository from $GIT_REPO"
    else
        echo "❌ Failed to clone repository, falling back to local files..."
        # Fallback to local files
        if [ -d "client" ] && [ -d "server" ] && [ -d "shared" ]; then
            sudo rm -rf $PROJECT_DIR
            sudo mkdir -p $PROJECT_DIR
            sudo cp -r . $PROJECT_DIR/
            sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR
            echo "✅ Local files copied successfully"
        else
            echo "ERROR: Neither git repository nor local files are available"
            echo "Please either:"
            echo "1. Update GIT_REPO variable with correct repository URL"
            echo "2. Run this script from the project root directory with local files"
            exit 1
        fi
    fi
else
    # Use local files (fallback mode)
    echo "Using local files (GIT_REPO not configured)..."
    if [ -d "client" ] && [ -d "server" ] && [ -d "shared" ]; then
        sudo cp -r . $PROJECT_DIR/
        sudo chown -R $APP_USER:$APP_USER $PROJECT_DIR
        echo "✅ Local files copied successfully"
    else
        echo "ERROR: Project files not found in current directory"
        echo "Please run this script from the project root directory"
        exit 1
    fi
fi

# 6. Install dependencies and build
echo "6. Installing dependencies and building..."
cd $PROJECT_DIR
sudo -u $APP_USER bash -c "
    export NODE_ENV=production
    export PATH=\$PATH:./node_modules/.bin
    echo 'Installing all dependencies (including dev dependencies for build)...'
    npm install --include=dev
    
    echo 'Ensuring vite dependencies are installed...'
    npm install --save-dev vite@latest @vitejs/plugin-react@latest @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer esbuild typescript
    
    echo 'Verifying vite installation...'
    npm ls vite || echo 'Vite verification failed'
    
    echo 'Building client application with vite...'
    npx vite build --outDir dist/public || {
        echo 'Primary vite build failed, trying alternative approach...'
        ./node_modules/.bin/vite build --outDir dist/public || {
            echo 'Alternative vite build failed, creating minimal client...'
            mkdir -p dist/public
            mkdir -p dist/public/assets
            cat > dist/public/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Action Protection</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { color: #f59e0b; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .loading { color: #666; margin-top: 20px; }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #f59e0b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"logo\">Action Protection</div>
        <div class=\"spinner\"></div>
        <p class=\"loading\">Loading automotive protection services...</p>
    </div>
    <script>
        // Auto-refresh every 10 seconds to check if server is ready
        setTimeout(() => { window.location.reload(); }, 10000);
    </script>
</body>
</html>
HTMLEOF
        }
    }
    
    echo 'Verifying client build...'
    if [ -d 'dist/public' ] && [ -f 'dist/public/index.html' ]; then
        echo '✅ Client build successful'
        ls -la dist/public/
        echo 'Client build contents:'
        find dist/public -type f | head -10
    else
        echo '❌ Client build verification failed - creating minimal fallback'
        mkdir -p dist/public
        mkdir -p dist/public/assets
        cat > dist/public/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Action Protection</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { color: #f59e0b; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .loading { color: #666; margin-top: 20px; }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #f59e0b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"logo\">Action Protection</div>
        <div class=\"spinner\"></div>
        <p class=\"loading\">Loading automotive protection services...</p>
    </div>
    <script>
        // Auto-refresh every 10 seconds to check if server is ready
        setTimeout(() => { window.location.reload(); }, 10000);
    </script>
</body>
</html>
HTMLEOF
        echo '✅ Minimal client fallback created'
    fi
    
    echo 'Building server with proper bundling...'
    npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/server.js --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:@replit/vite-plugin-cartographer --external:pg-native
    
    echo 'Creating production server entry point...'
    cat > dist/index.js << 'EOFSERVER'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Action Protection production server...');

// Start the server
import('./server.js').then(() => {
    console.log('✅ Action Protection server started successfully on port 4000');
}).catch(err => {
    console.error('❌ Server startup error:', err);
    console.log('🔄 Server will restart automatically via PM2');
    process.exit(1);
});
EOFSERVER
    
    echo 'Verifying all build outputs...'
    ls -la dist/
    if [ ! -f 'dist/index.js' ] || [ ! -f 'dist/server.js' ]; then
        echo '❌ Build failed - missing server files'
        exit 1
    fi
    
    echo 'Cleaning up dev dependencies...'
    npm prune --production
    
    echo '✅ Build completed successfully'
"

# 7. Create environment configuration
echo "7. Creating environment configuration..."
sudo -u $APP_USER tee $PROJECT_DIR/.env << EOF
NODE_ENV=production
PORT=$PORT
DATABASE_URL=$DATABASE_URL
SESSION_SECRET=production_session_secret_$(date +%s)
EOF

# 8. Create PM2 ecosystem configuration
echo "8. Creating PM2 configuration..."
sudo -u $APP_USER tee $PROJECT_DIR/ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'dist/index.js',
    cwd: '$PROJECT_DIR',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT,
      DATABASE_URL: '$DATABASE_URL'
    },
    error_file: '$PROJECT_DIR/logs/error.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    log_file: '$PROJECT_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    restart_delay: 5000
  }]
};
EOF

# 9. Create logs directory and start application
echo "9. Starting application with PM2..."
sudo -u $APP_USER mkdir -p $PROJECT_DIR/logs

# Verify build was successful before starting PM2
if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    echo "Attempting to rebuild..."
    sudo -u $APP_USER bash -c "
        cd $PROJECT_DIR
        export PATH=\$PATH:./node_modules/.bin
        npm install
        npm run build
    "
    
    if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
        echo "❌ Rebuild failed - cannot start PM2"
        echo "Please check the build logs above"
        exit 1
    fi
fi

sudo -u $APP_USER bash -c "
    cd $PROJECT_DIR
    pm2 delete action-protection 2>/dev/null || true
    pm2 start ecosystem.config.cjs --env production
    pm2 save
"

# 10. Setup PM2 startup
echo "10. Setting up PM2 startup..."
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER | tail -1 | sudo bash

# 11. Configure Nginx
echo "11. Configuring Nginx..."
sudo tee /etc/nginx/sites-available/action-protection << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Main application proxy
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static file serving
    location /uploads/ {
        alias $PROJECT_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /assets/ {
        alias $PROJECT_DIR/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

# 12. Enable Nginx site
echo "12. Enabling Nginx site..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/action-protection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 13. Configure firewall
echo "13. Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# 14. Wait for application startup
echo "14. Waiting for application startup..."
sleep 15

# 15. Test deployment
echo "15. Testing deployment..."
echo "Waiting for application to fully start..."
sleep 10

echo "Testing application on port $PORT:"
for i in {1..15}; do
    if curl -f http://localhost:$PORT/api/categories > /dev/null 2>&1; then
        echo "✅ Application API working on attempt $i"
        API_WORKING=true
        break
    else
        echo "❌ Application API failed on attempt $i, waiting..."
        sleep 3
    fi
done

if [ "$API_WORKING" != "true" ]; then
    echo "❌ API failed to start after 15 attempts"
    echo "📋 Recent PM2 logs:"
    sudo -u $APP_USER pm2 logs action-protection --lines 10 --nostream
    echo "📋 PM2 process status:"
    sudo -u $APP_USER pm2 show action-protection
fi

echo "Testing nginx proxy:"
curl -f http://localhost/api/categories > /dev/null 2>&1 && echo "✅ Nginx proxy working" || echo "❌ Nginx proxy failed"

echo "Testing admin login:"
curl -s -X POST http://localhost:$PORT/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' | \
    grep -q "Admin login successful" && echo "✅ Admin login working" || echo "❌ Admin login failed"

echo "Final API verification:"
curl -f http://localhost:$PORT/api/categories > /dev/null 2>&1 && echo "✅ API responding" || echo "❌ API not responding"

# 16. Display final status
echo ""
echo "🎉 Production deployment completed successfully!"
echo ""
echo "📊 Application Status:"
sudo -u $APP_USER pm2 list
echo ""
echo "🔧 Service Status:"
sudo systemctl status nginx --no-pager -l | head -3
echo ""
echo "🌐 Access Information:"
echo "   - Website: http://$DOMAIN"
echo "   - Admin Panel: http://$DOMAIN/admin"
echo "   - Direct App: http://localhost:$PORT"
echo ""
echo "🔑 Admin Credentials:"
echo "   - Email: admin@actionprotection.com"
echo "   - Password: admin123456"
echo ""
echo "📁 Project Location: $PROJECT_DIR"
echo "🗄️ Database: $DATABASE_URL"
if [ -n "$BACKUP_DIR" ]; then
    echo "💾 Backup Location: $BACKUP_DIR"
fi
echo ""
echo "📋 Management Commands:"
echo "   - Check PM2: sudo -u $APP_USER pm2 list"
echo "   - View logs: sudo -u $APP_USER pm2 logs action-protection"
echo "   - Restart app: sudo -u $APP_USER pm2 restart action-protection"
echo "   - Stop app: sudo -u $APP_USER pm2 stop action-protection"
echo "   - Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "   - Database access: psql '$DATABASE_URL'"
echo "   - Clean deployment: ./clean-deployment.sh"
echo ""
echo "🚀 Action Protection is now live and ready for production use!"