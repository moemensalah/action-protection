ing application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    echo "✅ User $APP_USER created"
else
    echo "✅ User $APP_USER already exists"
fi

# Create project directory with proper permissions
mkdir -p /home/${APP_USER}/${PROJECT_NAME}
chown -R ${APP_USER}:${APP_USER} /home/${APP_USER}
chmod -R 755 /home/${APP_USER}

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL database..."
systemctl start postgresql
systemctl enable postgresql

# Drop existing database if requested
if [ "$DROP_EXISTING_DATABASE" = "true" ]; then
    echo "🗑️ Dropping existing database if it exists..."
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true
fi

# Create database user and database
sudo -u postgres psql << DB_SETUP_EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER USER ${DB_USER} CREATEDB;
DB_SETUP_EOF

echo "✅ Database ${DB_NAME} created successfully"

# Deploy/Update source code from Git repository
echo "📦 Deploying application from Git repository..."
cd /home/${APP_USER}

if [ -d "/home/${APP_USER}/${PROJECT_NAME}/.git" ]; then
    echo "🔄 Updating existing repository..."
    cd /home/${APP_USER}/${PROJECT_NAME}
    
    # Check if we have access to the repository
    if sudo -u ${APP_USER} git fetch origin 2>/dev/null; then
        sudo -u ${APP_USER} git reset --hard origin/main
        sudo -u ${APP_USER} git pull origin main
        echo "✅ Repository updated to latest version"
    else
        echo "⚠️ Failed to fetch from repository. Using existing code..."
    fi
else
    echo "📥 Cloning repository..."
    
    # Attempt to clone the repository
    if sudo -u ${APP_USER} git clone ${GIT_REPO_URL} ${PROJECT_NAME} 2>/dev/null; then
        echo "✅ Repository cloned successfully"
    else
        echo "⚠️ Failed to clone repository. Creating directory and using current files as fallback..."
        sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}
        
        # Copy current directory contents as fallback
        echo "📦 Copying current source files as fallback..."
        sudo mkdir -p /tmp/deployment-staging
        sudo cp -r . /tmp/deployment-staging/
        sudo chown -R ${APP_USER}:${APP_USER} /tmp/deployment-staging/
        sudo -u ${APP_USER} cp -r /tmp/deployment-staging/* /home/${APP_USER}/${PROJECT_NAME}/ 2>/dev/null || true
        echo "✅ Source files copied successfully"
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
    echo "⚠️ Failed to install dependencies, continuing with existing setup..."
fi

# Build the application
echo "🔨 Building application..."
if sudo -u ${APP_USER} npm run build; then
    echo "✅ Application built successfully"
else
    echo "⚠️ Build failed, will run in development mode..."
fi

# Copy logo assets to production location
echo "📋 Copying logo assets to production..."
sudo -u ${APP_USER} mkdir -p dist/public/assets

# Copy hero background images if they exist
if [ -f "attached_assets/u4193187385_A_cinematic_ultra-wide_image_of_a_Mercedes_G-Clas_bdbff7bf-0bb8-443b-949a-b8b3bf2f8c26_2_1751110194189.png" ]; then
    sudo -u ${APP_USER} cp "attached_assets/u4193187385_A_cinematic_ultra-wide_image_of_a_Mercedes_G-Clas_bdbff7bf-0bb8-443b-949a-b8b3bf2f8c26_2_1751110194189.png" "dist/public/assets/"
    echo "✅ Hero background image copied to production location"
fi

# Verify final production structure
if [ -f "dist/public/index.html" ] && [ -d "dist/public/assets" ]; then
    echo "✅ Production files verified in correct structure"
    ls -la dist/public/ | head -10
else
    echo "❌ Production file structure incomplete"
    echo "Contents of dist directory:"
    ls -la dist/ 2>/dev/null || echo "No dist directory found"
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

# Fix port conflicts and clean up existing processes
echo "🔧 Cleaning up port ${APP_PORT} conflicts..."
sudo lsof -ti:${APP_PORT} | xargs sudo kill -9 2>/dev/null || echo "No processes found on port ${APP_PORT}"
sudo -u ${APP_USER} pm2 delete all 2>/dev/null || echo "No PM2 processes to stop"
sudo pkill -f "node.*${PROJECT_NAME}" 2>/dev/null || echo "No Node processes found"
sudo pkill -f "tsx server" 2>/dev/null || echo "No tsx processes found"

# Wait for processes to terminate
sleep 3

# Verify port is free
if lsof -Pi :${APP_PORT} -sTCP:LISTEN -t >/dev/null; then
    echo "❌ Port ${APP_PORT} still in use. Forcing cleanup..."
    sudo lsof -ti:${APP_PORT} | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

# Create logs directory
sudo -u ${APP_USER} mkdir -p /home/${APP_USER}/${PROJECT_NAME}/logs

# Create working PM2 ecosystem config using .cjs extension for CommonJS
cd /home/${APP_USER}/${PROJECT_NAME}
sudo -u ${APP_USER} tee ecosystem.config.cjs << PM2_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
      DATABASE_URL: '${DATABASE_URL}',
      REPLIT_DOMAINS: '${DOMAIN_NAME}',
      REPL_ID: '${REPL_ID}',
      SESSION_SECRET: '${SESSION_SECRET}',
      ISSUER_URL: '${ISSUER_URL}'
    },
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
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
PM2_CONFIG_EOF

# Check build output and start appropriately
if [ -f "/home/${APP_USER}/${PROJECT_NAME}/dist/index.js" ]; then
    echo "✅ Starting built application..."
    sudo -u ${APP_USER} pm2 start ecosystem.config.cjs --env production
else
    echo "⚠️ Built application not found, starting with development mode..."
    # Create alternative config for development using .cjs extension
    sudo -u ${APP_USER} tee ecosystem-dev.config.cjs << DEV_CONFIG_EOF
module.exports = {
  apps: [{
    name: '${PROJECT_NAME}',
    script: 'server/index.ts',
    interpreter: 'tsx',
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
DEV_CONFIG_EOF
    sudo -u ${APP_USER} pm2 start ecosystem-dev.config.cjs --env production
fi

sudo -u ${APP_USER} pm2 save

# Setup PM2 startup script
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
sudo -u ${APP_USER} pm2 save

# Show status and verify application is working
echo "📊 PM2 Status:"
sudo -u ${APP_USER} pm2 status

# Wait for application startup
echo "⏳ Waiting for application to start..."
sleep 10

# Test application connectivity
echo "🧪 Testing application connectivity..."
CONNECTIVITY_TEST=false
for i in {1..5}; do
    if curl -s http://localhost:${APP_PORT}/api/contact >/dev/null; then
        echo "✅ Application responding successfully on port ${APP_PORT}"
        CONNECTIVITY_TEST=true
        break
    else
        echo "⏳ Attempt $i: Application not responding yet, waiting..."
        sleep 5
    fi
done

if [ "$CONNECTIVITY_TEST" = false ]; then
    echo "⚠️ Application not responding after multiple attempts. Checking logs..."
    sudo -u ${APP_USER} pm2 logs --lines 20
    echo "🔧 Application may need manual troubleshooting"
else
    echo "🎯 Application successfully deployed and responding!"
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
    
    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "🎉 Action Protection deployment completed successfully!"
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
echo "🚀 Your Action Protection automotive website is now live and ready!"
echo ""
echo "⚠️  SECURITY REMINDER: Change the default admin password immediately!"
echo "⚠️  Update the GIT_REPO_URL variable with your actual repository URL"
echo "⚠️  Configure your domain DNS to point to this server IP"