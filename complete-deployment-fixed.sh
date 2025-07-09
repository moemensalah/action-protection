 \$\$
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