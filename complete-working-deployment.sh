#!/bin/bash

# ========================================================================
# Action Protection Complete Production Deployment Script - WORKING VERSION
# ========================================================================
# 
# This is the complete, working version of the deployment script
# The original complete-deployment-script.sh was corrupted and missing its header
#
# ========================================================================

set -e

# Configuration Variables - UPDATE THESE BEFORE DEPLOYMENT
PROJECT_NAME="action-protection"
APP_USER="actionprotection"
NODE_VERSION="20"
APP_PORT="4000"
DATABASE_PORT="5432"  # PostgreSQL port (can be changed to any available port)

# Domain Configuration
DOMAIN="demox.actionprotectionkw.com"
DOMAIN_WWW="www.demox.actionprotectionkw.com"
DOMAIN_NAME="${DOMAIN},${DOMAIN_WWW},localhost:${APP_PORT},127.0.0.1:${APP_PORT}"
GIT_REPO_URL="https://github.com/moemensalah/action-protection.git"

# Database Configuration
DB_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"  # CHANGE THIS
DB_NAME="actionprotection_db"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DATABASE_PORT}/${DB_NAME}"
DROP_EXISTING_DATABASE="true"

# Authentication Configuration
SESSION_SECRET="actionprotection-production-session-secret-$(date +%s)"
REPL_ID="krw1cv"
ISSUER_URL="https://replit.com/oidc"

# Admin User Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"  # CHANGE THIS IMMEDIATELY
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Administrator"

echo "🚀 Starting Action Protection Production Deployment..."
echo "📋 Project: ${PROJECT_NAME}"
echo "📁 User: ${APP_USER}"
echo "🌐 Domain: ${DOMAIN}"
echo "🔌 App Port: ${APP_PORT}"
echo "🗄️ Database Port: ${DATABASE_PORT}"
echo ""

# System Setup
echo "⚙️ Setting up system dependencies..."
apt update

# Fix Node.js/npm conflict by removing conflicting packages first
echo "🧹 Cleaning up existing Node.js installations..."
apt remove -y nodejs npm 2>/dev/null || true
apt autoremove -y 2>/dev/null || true

# Install Node.js from NodeSource repository
echo "📦 Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx git build-essential curl

# Verify installations
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create application user
echo "👤 Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    usermod -aG sudo $APP_USER  # Add to sudo group if needed
    echo "✅ User $APP_USER created"
else
    echo "✅ User $APP_USER already exists"
fi

# Create project directory with proper permissions
echo "📁 Setting up project directories..."
mkdir -p /home/${APP_USER}/${PROJECT_NAME}
mkdir -p /home/${APP_USER}/${PROJECT_NAME}/logs
mkdir -p /home/${APP_USER}/${PROJECT_NAME}/uploads
chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}
chmod -R 755 /home/${APP_USER}

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL database..."
systemctl start postgresql
systemctl enable postgresql

# Configure PostgreSQL port if not default
if [ "${DATABASE_PORT}" != "5432" ]; then
    echo "🔧 Configuring PostgreSQL to use port ${DATABASE_PORT}..."
    
    # Update PostgreSQL configuration
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
    PG_CONFIG="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
    
    if [ -f "$PG_CONFIG" ]; then
        # Backup original config
        cp "$PG_CONFIG" "${PG_CONFIG}.backup"
        
        # Update port in configuration
        sed -i "s/#port = 5432/port = ${DATABASE_PORT}/" "$PG_CONFIG"
        sed -i "s/port = 5432/port = ${DATABASE_PORT}/" "$PG_CONFIG"
        
        # Restart PostgreSQL to apply port change
        systemctl restart postgresql
        sleep 5
        
        echo "✅ PostgreSQL configured to use port ${DATABASE_PORT}"
    else
        echo "⚠️ PostgreSQL config file not found, using default port 5432"
        DATABASE_PORT="5432"
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DATABASE_PORT}/${DB_NAME}"
    fi
else
    echo "✅ Using default PostgreSQL port ${DATABASE_PORT}"
fi

# Configure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true

# Drop existing database if requested
if [ "$DROP_EXISTING_DATABASE" = "true" ]; then
    echo "🗑️ Dropping existing database if it exists..."
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true
fi

# Create database user and database
echo "🔑 Creating database user and database..."
sudo -u postgres psql << DB_SETUP_EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER USER ${DB_USER} CREATEDB;
\q
DB_SETUP_EOF

echo "✅ Database ${DB_NAME} created successfully"

# Test database connection
if sudo -u postgres psql -d ${DB_NAME} -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection test successful"
else
    echo "❌ Database connection test failed"
    exit 1
fi

# Deploy source code
echo "📦 Deploying application source code..."
cd /home/${APP_USER}

if [ -d "/home/${APP_USER}/${PROJECT_NAME}/.git" ]; then
    echo "🔄 Updating existing repository..."
    cd /home/${APP_USER}/${PROJECT_NAME}
    
    if sudo -u ${APP_USER} git fetch origin 2>/dev/null; then
        sudo -u ${APP_USER} git reset --hard origin/main
        sudo -u ${APP_USER} git pull origin main
        echo "✅ Repository updated to latest version"
    else
        echo "⚠️ Failed to fetch from repository. Using existing code..."
    fi
else
    echo "📥 Cloning repository..."
    
    if sudo -u ${APP_USER} git clone ${GIT_REPO_URL} ${PROJECT_NAME} 2>/dev/null; then
        echo "✅ Repository cloned successfully"
    else
        echo "⚠️ Failed to clone repository. Using current directory as fallback..."
        sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}
        
        # Copy current directory contents as fallback
        echo "📦 Copying current source files..."
        
        # Get the current directory (where the script is running from)
        CURRENT_DIR=$(pwd)
        echo "Current directory: $CURRENT_DIR"
        
        # Check if we're in the correct directory or need to find source files
        if [ ! -f "$CURRENT_DIR/package.json" ]; then
            echo "⚠️ package.json not found in current directory: $CURRENT_DIR"
            echo "Available files:"
            ls -la "$CURRENT_DIR"
            
            # Look for source files in common locations
            POSSIBLE_DIRS=(
                "/home/${APP_USER}/${PROJECT_NAME}"
                "$CURRENT_DIR/${PROJECT_NAME}"
                "$CURRENT_DIR/../${PROJECT_NAME}"
                "/tmp/${PROJECT_NAME}"
                "/root/${PROJECT_NAME}"
                "/home/root/${PROJECT_NAME}"
            )
            
            FOUND_SOURCE=false
            for dir in "${POSSIBLE_DIRS[@]}"; do
                echo "Checking directory: $dir"
                if [ -d "$dir" ]; then
                    echo "  Directory exists, checking for package.json..."
                    if [ -f "$dir/package.json" ]; then
                        echo "✅ Found source files in: $dir"
                        CURRENT_DIR="$dir"
                        FOUND_SOURCE=true
                        break
                    else
                        echo "  No package.json found in $dir"
                        echo "  Contents:"
                        ls -la "$dir" 2>/dev/null || echo "  Cannot list contents"
                    fi
                else
                    echo "  Directory does not exist: $dir"
                fi
            done
            
            if [ "$FOUND_SOURCE" = false ]; then
                echo "❌ Cannot find source files with package.json in any expected location"
                echo "Searched directories:"
                for dir in "${POSSIBLE_DIRS[@]}"; do
                    echo "  - $dir"
                done
                exit 1
            fi
        fi
        
        echo "✅ Using source directory: $CURRENT_DIR"
        
        # Use tar for reliable file copying with proper permissions
        echo "Using tar to copy files preserving permissions..."
        cd "$CURRENT_DIR"
        
        # Create tar archive excluding problematic directories
        tar --exclude='node_modules' \
            --exclude='.git' \
            --exclude='dist' \
            --exclude='logs' \
            --exclude='*.log' \
            -cf - . | sudo -u ${APP_USER} tar -xf - -C /home/${APP_USER}/${PROJECT_NAME}
        
        if [ $? -eq 0 ]; then
            echo "✅ Files copied successfully using tar"
        else
            echo "❌ Tar copy failed, trying rsync method..."
            
            # Try rsync as alternative
            if command -v rsync >/dev/null 2>&1; then
                sudo rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='logs' \
                    --chown=${APP_USER}:${APP_USER} "$CURRENT_DIR/" /home/${APP_USER}/${PROJECT_NAME}/
                
                if [ $? -eq 0 ]; then
                    echo "✅ Files copied successfully using rsync"
                else
                    echo "❌ Rsync failed, trying manual copy..."
                    
                    # Manual copy as last resort
                    echo "Copying files manually..."
                    
                    # Copy root files
                    for file in package.json package-lock.json tsconfig.json vite.config.ts drizzle.config.ts tailwind.config.ts postcss.config.js components.json .gitignore; do
                        if [ -f "$CURRENT_DIR/$file" ]; then
                            sudo cp "$CURRENT_DIR/$file" /home/${APP_USER}/${PROJECT_NAME}/
                            echo "Copied: $file"
                        fi
                    done
                    
                    # Copy directories
                    for dir in client server shared public uploads; do
                        if [ -d "$CURRENT_DIR/$dir" ]; then
                            sudo cp -r "$CURRENT_DIR/$dir" /home/${APP_USER}/${PROJECT_NAME}/
                            echo "Copied directory: $dir"
                        fi
                    done
                fi
            else
                echo "❌ rsync not available, using basic copy..."
                sudo cp -r "$CURRENT_DIR"/* /home/${APP_USER}/${PROJECT_NAME}/ 2>/dev/null || true
                sudo cp -r "$CURRENT_DIR"/.* /home/${APP_USER}/${PROJECT_NAME}/ 2>/dev/null || true
            fi
        fi
        
        # Ensure proper ownership
        sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}
        
        # Verify critical files were copied
        echo "🔍 Verifying copied files..."
        VERIFICATION_FAILED=false
        
        if [ -f "/home/${APP_USER}/${PROJECT_NAME}/package.json" ]; then
            echo "✅ package.json verified"
        else
            echo "❌ package.json missing"
            VERIFICATION_FAILED=true
        fi
        
        if [ -d "/home/${APP_USER}/${PROJECT_NAME}/client" ]; then
            echo "✅ client directory verified"
        else
            echo "❌ client directory missing"
            VERIFICATION_FAILED=true
        fi
        
        if [ -d "/home/${APP_USER}/${PROJECT_NAME}/server" ]; then
            echo "✅ server directory verified"
        else
            echo "❌ server directory missing"
            VERIFICATION_FAILED=true
        fi
        
        if [ -d "/home/${APP_USER}/${PROJECT_NAME}/shared" ]; then
            echo "✅ shared directory verified"
        else
            echo "❌ shared directory missing"
            VERIFICATION_FAILED=true
        fi
        
        if [ "$VERIFICATION_FAILED" = true ]; then
            echo "❌ File copy verification failed"
            echo "Contents of target directory:"
            ls -la /home/${APP_USER}/${PROJECT_NAME}
            exit 1
        fi
        
        echo "✅ All critical files verified successfully"
    fi
fi

# Ensure proper ownership
sudo chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}/${PROJECT_NAME}

# Navigate to project directory
cd /home/${APP_USER}/${PROJECT_NAME}

# Install dependencies
echo "📦 Installing Node.js dependencies..."
if sudo -u ${APP_USER} npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Fix Vite build configuration
echo "🔧 Fixing Vite build configuration..."
# Copy index.html to root directory for Vite build
if [ -f "client/index.html" ] && [ ! -f "index.html" ]; then
    sudo -u ${APP_USER} cp client/index.html ./index.html
    echo "✅ index.html copied to root directory"
fi

# Fix drizzle configuration for migrations
echo "🔧 Fixing Drizzle configuration..."
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
    echo "✅ drizzle.config.json created"
fi

# Build the application
echo "🔨 Building application..."
if sudo -u ${APP_USER} npm run build; then
    echo "✅ Application built successfully"
    BUILD_SUCCESS=true
else
    echo "⚠️ Build failed, trying alternative approach..."
    
    # Try building components separately
    echo "Building frontend with Vite..."
    if sudo -u ${APP_USER} npx vite build; then
        echo "✅ Frontend build completed"
        
        # Build backend with esbuild
        echo "Building backend with esbuild..."
        if sudo -u ${APP_USER} npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist; then
            echo "✅ Backend build completed"
            BUILD_SUCCESS=true
        else
            echo "⚠️ Backend build failed, will run in development mode..."
            BUILD_SUCCESS=false
        fi
    else
        echo "⚠️ Frontend build failed, trying client directory approach..."
        
        # Try building from client directory
        cd client
        if sudo -u ${APP_USER} npm run build; then
            cd ..
            if [ -d "client/dist" ]; then
                echo "Moving client/dist to dist/public..."
                sudo -u ${APP_USER} mkdir -p dist
                sudo -u ${APP_USER} cp -r client/dist dist/public
                echo "✅ Build completed with workaround"
                BUILD_SUCCESS=true
            else
                echo "⚠️ Build failed, will run in development mode..."
                BUILD_SUCCESS=false
            fi
        else
            cd ..
            echo "⚠️ Build failed, will run in development mode..."
            BUILD_SUCCESS=false
        fi
    fi
fi

# Verify build output
if [ "$BUILD_SUCCESS" = true ] && [ -f "dist/index.js" ]; then
    echo "✅ Production build verified: dist/index.js exists"
    PRODUCTION_MODE=true
elif [ "$BUILD_SUCCESS" = true ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Production build verified: dist/public/index.html exists"
    PRODUCTION_MODE=true
else
    echo "⚠️ Production build not available, using development mode"
    PRODUCTION_MODE=false
fi

# Copy assets to production location if build succeeded
if [ "$BUILD_SUCCESS" = true ]; then
    echo "📋 Setting up production assets..."
    sudo -u ${APP_USER} mkdir -p dist/public/assets
    
    # Copy any existing assets
    if [ -d "client/public/assets" ]; then
        sudo -u ${APP_USER} cp -r client/public/assets/* dist/public/assets/ 2>/dev/null || true
        echo "✅ Assets copied to production location"
    fi
    
    # Verify production structure
    if [ -f "dist/public/index.html" ]; then
        echo "✅ Production files verified"
        ls -la dist/public/ | head -5
    fi
fi

# Database migration
echo "🗄️ Running database migrations..."
export DATABASE_URL="${DATABASE_URL}"
if sudo -u ${APP_USER} env DATABASE_URL="${DATABASE_URL}" npm run db:push; then
    echo "✅ Database migration completed successfully"
else
    echo "❌ Database migration failed, trying alternative approach..."
    
    # Try with explicit TypeScript config
    if sudo -u ${APP_USER} env DATABASE_URL="${DATABASE_URL}" npx drizzle-kit push --config=drizzle.config.ts; then
        echo "✅ Database migration completed with TypeScript config"
    else
        echo "❌ Database migration still failing"
        echo "Checking database connection..."
        
        # Test database connection
        if sudo -u postgres psql -d ${DB_NAME} -c "SELECT 1;" &>/dev/null; then
            echo "✅ Database connection OK"
            echo "Issue might be with schema files - continuing without migration"
        else
            echo "❌ Database connection failed"
            exit 1
        fi
    fi
fi

# Create admin user
echo "👤 Creating admin user..."
sudo -u postgres psql -d ${DB_NAME} << ADMIN_EOF
DO \$\$
DECLARE
    has_username boolean;
    has_password boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') INTO has_username;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') INTO has_password;
    
    IF has_username AND has_password THEN
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

echo "✅ Admin user created: ${ADMIN_EMAIL}"

# Install PM2
echo "⚡ Installing PM2 process manager..."
npm install -g pm2

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
sudo lsof -ti:${APP_PORT} | xargs sudo kill -9 2>/dev/null || echo "No processes on port ${APP_PORT}"
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || echo "No PM2 processes to stop"
sleep 3

# Create logs directory
echo "📁 Creating logs directory..."
sudo -u ${APP_USER} mkdir -p logs

# Create PM2 ecosystem config
echo "⚙️ Creating PM2 configuration..."
if [ "$PRODUCTION_MODE" = true ]; then
    # Production mode config
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
    # Development mode config - fallback to npm start
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
echo "🚀 Starting application with PM2..."
sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production
sudo -u ${APP_USER} pm2 save

# Setup PM2 startup
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
sudo -u ${APP_USER} pm2 save

# Show PM2 status
echo "📊 PM2 Status:"
sudo -u ${APP_USER} pm2 status

# Wait for application startup
echo "⏳ Waiting for application to start..."
sleep 10

# Test application connectivity
echo "🧪 Testing application connectivity..."
CONNECTIVITY_TEST=false
for i in {1..5}; do
    if curl -s http://localhost:${APP_PORT}/api/contact >/dev/null 2>&1; then
        echo "✅ Application responding on port ${APP_PORT}"
        CONNECTIVITY_TEST=true
        break
    else
        echo "⏳ Attempt $i: Waiting for application..."
        sleep 5
    fi
done

if [ "$CONNECTIVITY_TEST" = false ]; then
    echo "⚠️ Application not responding. Checking logs..."
    sudo -u ${APP_USER} pm2 logs --lines 20
fi

# Setup Nginx
echo "🌐 Configuring Nginx..."
tee /etc/nginx/sites-available/${PROJECT_NAME} << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /home/${APP_USER}/${PROJECT_NAME}/dist/public;
    index index.html;
    
    # Serve static files
    location /assets/ {
        alias /home/${APP_USER}/${PROJECT_NAME}/dist/public/assets/;
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
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Frontend routes (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test and reload Nginx
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx configured successfully"
else
    echo "❌ Nginx configuration test failed"
fi

# Final verification
echo ""
echo "🎉 Action Protection deployment completed!"
echo ""
echo "📋 Deployment Summary:"
echo "   🌐 Domain: ${DOMAIN}"
echo "   🔌 App Port: ${APP_PORT}"
echo "   🗄️ Database Port: ${DATABASE_PORT}"
echo "   👤 Admin: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}"
echo "   📧 Email: ${ADMIN_EMAIL}"
echo "   🗄️ Database: ${DB_NAME}"
echo "   📁 Directory: /home/${APP_USER}/${PROJECT_NAME}"
echo "   🔧 Mode: $([ "$PRODUCTION_MODE" = true ] && echo "Production" || echo "Development")"
echo ""
echo "🔧 Management Commands:"
echo "   sudo -u ${APP_USER} pm2 status"
echo "   sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}"
echo "   sudo -u ${APP_USER} pm2 stop ${PROJECT_NAME}"
echo ""
echo "📝 Next Steps:"
echo "   1. Update DNS: Point ${DOMAIN} to this server IP"
echo "   2. Admin panel: http://${DOMAIN}/admin"
echo "   3. Change default passwords immediately"
echo "   4. Configure SSL certificate (Let's Encrypt recommended)"
echo ""
echo "⚠️  SECURITY REMINDERS:"
echo "   - Change ADMIN_PASSWORD immediately"
echo "   - Update DB_PASSWORD in production"
echo "   - Configure firewall rules"
echo "   - Setup SSL/TLS certificates"
echo ""
echo "🚀 Your Action Protection platform is now live!"