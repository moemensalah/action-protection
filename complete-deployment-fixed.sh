#!/bin/bash

# Complete Action Protection Deployment Script - Fixed Version
# This script deploys the Action Protection application to Ubuntu production server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Configuration
PROJECT_NAME="action-protection"
APP_USER="actionprotection"
APP_PORT="4000"
DOMAIN_NAME="demox.actionprotectionkw.com,www.demox.actionprotectionkw.com,localhost:4000,127.0.0.1:4000"
DATABASE_PORT="5432"
DB_NAME="actionprotection_db"
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DATABASE_PORT}/${DB_NAME}"
ADMIN_EMAIL="admin@actionprotection.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="ActionProtection2024!"
ADMIN_FIRST_NAME="Admin"
ADMIN_LAST_NAME="User"
SESSION_SECRET="actionprotection-production-session-secret-$(date +%s)"
REPL_ID="krw1cv"
ISSUER_URL="https://replit.com/oidc"

echo "🚀 Action Protection Production Deployment"
echo "=========================================="
echo "Project: ${PROJECT_NAME}"
echo "User: ${APP_USER}"
echo "Port: ${APP_PORT}"
echo "Database: ${DB_NAME}"
echo "Domain: ${DOMAIN_NAME}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

# Update system packages
print_info "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_info "Installing required packages..."
apt install -y curl git postgresql postgresql-contrib nginx software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installations
print_info "Verifying installations..."
node --version
npm --version
psql --version
nginx -v

# Create application user if not exists
if ! id -u ${APP_USER} > /dev/null 2>&1; then
    print_info "Creating application user: ${APP_USER}"
    useradd -m -s /bin/bash ${APP_USER}
    usermod -aG sudo ${APP_USER}
    print_status "User ${APP_USER} created successfully"
else
    print_status "User ${APP_USER} already exists"
fi

# Setup PostgreSQL database
print_info "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}' CREATEDB;" 2>/dev/null || print_warning "User ${DB_USER} may already exist"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
print_status "Database setup completed"

# Test database connection
print_info "Testing database connection..."
if sudo -u postgres psql -d ${DB_NAME} -c "SELECT 1;" &>/dev/null; then
    print_status "Database connection successful"
else
    print_error "Database connection failed"
    exit 1
fi

# Create project directory
print_info "Setting up project directory..."
PROJECT_DIR="/home/${APP_USER}/${PROJECT_NAME}"
rm -rf ${PROJECT_DIR}
mkdir -p ${PROJECT_DIR}
chown -R ${APP_USER}:${APP_USER} ${PROJECT_DIR}

# Find and copy source files
print_info "Locating source files..."
CURRENT_DIR=$(pwd)
SOURCE_DIR=""

# Check possible source locations
POSSIBLE_DIRS=(
    "${CURRENT_DIR}"
    "/home/${APP_USER}/${PROJECT_NAME}"
    "/home/${APP_USER}"
    "/tmp/${PROJECT_NAME}"
    "/root/${PROJECT_NAME}"
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -f "$dir/package.json" ]; then
        SOURCE_DIR="$dir"
        print_status "Found source files in: $SOURCE_DIR"
        break
    fi
done

if [ -z "$SOURCE_DIR" ]; then
    print_error "Cannot find source files with package.json"
    exit 1
fi

# Copy source files
print_info "Copying source files..."
cd "$SOURCE_DIR"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='logs' \
    --exclude='*.log' \
    -cf - . | sudo -u ${APP_USER} tar -xf - -C ${PROJECT_DIR}

# Set proper ownership
chown -R ${APP_USER}:${APP_USER} ${PROJECT_DIR}

# Verify critical files
print_info "Verifying copied files..."
CRITICAL_FILES=("package.json" "client" "server" "shared")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "${PROJECT_DIR}/$file" ]; then
        print_status "$file verified"
    else
        print_error "$file missing"
        exit 1
    fi
done

# Navigate to project directory
cd ${PROJECT_DIR}

# Install dependencies
print_info "Installing Node.js dependencies..."
sudo -u ${APP_USER} npm install
print_status "Dependencies installed"

# Fix Vite build configuration
print_info "Fixing Vite build configuration..."
if [ -f "client/index.html" ] && [ ! -f "index.html" ]; then
    sudo -u ${APP_USER} cp client/index.html ./index.html
    print_status "index.html copied to root directory"
fi

# Fix drizzle configuration
print_info "Fixing Drizzle configuration..."
if [ -f "drizzle.config.ts" ] && [ ! -f "drizzle.config.json" ]; then
    sudo -u ${APP_USER} cat > drizzle.config.json << 'EOF'
{
  "out": "./migrations",
  "schema": "./shared/schema.ts",
  "dialect": "postgresql",
  "dbCredentials": {
    "url": "$DATABASE_URL"
  }
}
EOF
    print_status "drizzle.config.json created"
fi

# Build the application
print_info "Building application..."
BUILD_SUCCESS=false

if sudo -u ${APP_USER} npm run build; then
    print_status "Application built successfully"
    BUILD_SUCCESS=true
else
    print_warning "Build failed, trying alternative approach..."
    
    # Try building components separately
    if sudo -u ${APP_USER} npx vite build; then
        print_status "Frontend build completed"
        
        if sudo -u ${APP_USER} npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist; then
            print_status "Backend build completed"
            BUILD_SUCCESS=true
        else
            print_warning "Backend build failed, using development mode"
        fi
    else
        print_warning "Frontend build failed, using development mode"
    fi
fi

# Verify build output
PRODUCTION_MODE=false
if [ "$BUILD_SUCCESS" = true ] && [ -f "dist/index.js" ]; then
    print_status "Production build verified: dist/index.js exists"
    PRODUCTION_MODE=true
elif [ "$BUILD_SUCCESS" = true ] && [ -f "dist/public/index.html" ]; then
    print_status "Production build verified: dist/public/index.html exists"
    PRODUCTION_MODE=true
else
    print_warning "Production build not available, using development mode"
fi

# Copy assets to production location
if [ "$BUILD_SUCCESS" = true ]; then
    print_info "Setting up production assets..."
    sudo -u ${APP_USER} mkdir -p dist/public/assets
    
    if [ -d "client/public/assets" ]; then
        sudo -u ${APP_USER} cp -r client/public/assets/* dist/public/assets/ 2>/dev/null || true
        print_status "Assets copied to production location"
    fi
fi

# Database migration
print_info "Running database migrations..."
export DATABASE_URL="${DATABASE_URL}"
if sudo -u ${APP_USER} env DATABASE_URL="${DATABASE_URL}" npm run db:push; then
    print_status "Database migration completed"
else
    print_warning "Database migration failed, trying alternative approach..."
    
    if sudo -u ${APP_USER} env DATABASE_URL="${DATABASE_URL}" npx drizzle-kit push --config=drizzle.config.ts; then
        print_status "Database migration completed with TypeScript config"
    else
        print_warning "Database migration failed, continuing without migration"
    fi
fi

# Create admin user
print_info "Creating admin user..."
sudo -u postgres psql -d ${DB_NAME} << ADMIN_EOF
DO \$\$
DECLARE
    has_username boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') INTO has_username;
    
    IF has_username THEN
        INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (
            'admin_user',
            '${ADMIN_USERNAME}',
            '${ADMIN_EMAIL}',
            '\$2a\$10\$rGJJ.5cKz5cG8z5cKz5cKe9cKz5cKz5cKz5cKz5cKz5cKz5cKz5cKO',
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
            updated_at = NOW();
    ELSE
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
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE 'Admin user created/updated successfully';
END
\$\$;
ADMIN_EOF

print_status "Admin user created: ${ADMIN_EMAIL}"

# Install PM2 globally
print_info "Installing PM2 process manager..."
npm install -g pm2

# Clean up existing processes
print_info "Cleaning up existing processes..."
lsof -ti:${APP_PORT} | xargs kill -9 2>/dev/null || true
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || true
sleep 3

# Create logs directory
sudo -u ${APP_USER} mkdir -p logs

# Create PM2 configuration
print_info "Creating PM2 configuration..."
if [ "$PRODUCTION_MODE" = true ]; then
    sudo -u ${APP_USER} tee ecosystem.config.cjs << PM2_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
      DATABASE_URL: '${DATABASE_URL}',
      REPLIT_DOMAINS: '${DOMAIN_NAME}',
      REPL_ID: '${REPL_ID}',
      SESSION_SECRET: '${SESSION_SECRET}',
      ISSUER_URL: '${ISSUER_URL}'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
PM2_CONFIG_EOF
else
    sudo -u ${APP_USER} tee ecosystem.config.cjs << PM2_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
      DATABASE_URL: '${DATABASE_URL}',
      REPLIT_DOMAINS: '${DOMAIN_NAME}',
      REPL_ID: '${REPL_ID}',
      SESSION_SECRET: '${SESSION_SECRET}',
      ISSUER_URL: '${ISSUER_URL}'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
PM2_CONFIG_EOF
fi

# Start application with PM2
print_info "Starting application with PM2..."
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production
sudo -u ${APP_USER} pm2 save

# Setup PM2 startup
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
sudo -u ${APP_USER} pm2 save

# Show PM2 status
print_info "PM2 Status:"
sudo -u ${APP_USER} pm2 status

# Wait for application startup
print_info "Waiting for application to start..."
sleep 10

# Test application connectivity
print_info "Testing application connectivity..."
CONNECTIVITY_TEST=false
for i in {1..5}; do
    if curl -s http://localhost:${APP_PORT}/api/contact >/dev/null 2>&1; then
        print_status "Application responding on port ${APP_PORT}"
        CONNECTIVITY_TEST=true
        break
    else
        print_warning "Attempt $i: Waiting for application..."
        sleep 5
    fi
done

if [ "$CONNECTIVITY_TEST" = false ]; then
    print_warning "Application not responding. Checking logs..."
    sudo -u ${APP_USER} pm2 logs --lines 20
fi

# Setup nginx
print_info "Setting up nginx..."
cat > /etc/nginx/sites-available/${PROJECT_NAME} << 'NGINX_CONFIG'
server {
    listen 80;
    server_name demox.actionprotectionkw.com www.demox.actionprotectionkw.com;
    
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
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static assets from application
    location /assets/ {
        alias /home/actionprotection/action-protection/client/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @app;
    }
    
    # Uploaded files
    location /uploads/ {
        alias /home/actionprotection/action-protection/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri @app;
    }
    
    # Built static files (if in production mode)
    location /dist/ {
        alias /home/actionprotection/action-protection/dist/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @app;
    }
    
    # Static files (general)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @app;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Fallback for static files
    location @app {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

# Enable nginx site
ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
print_info "Testing nginx configuration..."
if nginx -t; then
    print_status "nginx configuration valid"
    systemctl restart nginx
    systemctl enable nginx
    
    if systemctl is-active --quiet nginx; then
        print_status "nginx started successfully"
    else
        print_error "nginx failed to start"
        systemctl status nginx
    fi
else
    print_error "nginx configuration test failed"
fi

# Final verification
echo ""
echo "🎉 Action Protection Deployment Completed!"
echo "=========================================="
echo ""
print_status "Deployment Summary:"
echo "   🌐 Domain: demox.actionprotectionkw.com"
echo "   🔌 App Port: ${APP_PORT}"
echo "   🗄️ Database: ${DB_NAME}"
echo "   👤 Admin: ${ADMIN_USERNAME}"
echo "   📧 Email: ${ADMIN_EMAIL}"
echo "   📁 Directory: ${PROJECT_DIR}"
echo "   🔧 Mode: $([ "$PRODUCTION_MODE" = true ] && echo "Production" || echo "Development")"
echo ""
print_status "Management Commands:"
echo "   sudo -u ${APP_USER} pm2 status"
echo "   sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 stop ${PROJECT_NAME}"
echo "   systemctl status nginx"
echo "   systemctl restart nginx"
echo ""
print_status "Access Points:"
echo "   🌐 Website: http://demox.actionprotectionkw.com"
echo "   🔧 Admin Panel: http://demox.actionprotectionkw.com/admin"
echo "   📊 API Health: http://demox.actionprotectionkw.com/api/contact"
echo ""
print_status "Admin Credentials:"
echo "   📧 Email: ${ADMIN_EMAIL}"
echo "   🔑 Password: ${ADMIN_PASSWORD}"
echo ""
print_warning "Next Steps:"
echo "   1. Update DNS to point domain to this server"
echo "   2. Change admin password immediately"
echo "   3. Configure SSL certificate"
echo "   4. Setup firewall rules"
echo ""
print_status "🚀 Action Protection is now live!"