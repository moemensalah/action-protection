#!/bin/bash

# ========================================================================
# Quick Production Setup Script
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
DB_PASSWORD="ajHQGHgwqhg3ggagdg"

echo "🚀 Setting up Action Protection in production..."

# 1. Stop any existing processes
echo "1. Stopping existing processes..."
sudo -u $APP_USER pm2 stop all || true
sudo -u $APP_USER pm2 delete all || true

# 2. Set up environment
echo "2. Setting up environment..."
cd $PROJECT_DIR

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://actionprotection:${DB_PASSWORD}@localhost:5432/actionprotection_db
SESSION_SECRET=production_session_secret_$(date +%s)
EOF

# 3. Install dependencies
echo "3. Installing dependencies..."
npm install --production

# 4. Build application
echo "4. Building application..."
npm run build

# 5. Run database migrations
echo "5. Running database migrations..."
npm run db:push

# 6. Create admin user
echo "6. Creating admin user..."
sudo -u postgres psql -d actionprotection_db << 'EOF'
-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@actionprotection.com';

-- Insert admin user
INSERT INTO users (
    id, 
    email, 
    username, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'admin_user_' || extract(epoch from now()),
    'admin@actionprotection.com',
    'admin',
    '$2b$12$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
);
EOF

# 7. Create PM2 ecosystem config
echo "7. Creating PM2 configuration..."
cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '$PROJECT_DIR',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://actionprotection:${DB_PASSWORD}@localhost:5432/actionprotection_db',
      SESSION_SECRET: 'production_session_secret_$(date +%s)'
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

# 8. Create logs directory
echo "8. Creating logs directory..."
mkdir -p logs

# 9. Start application
echo "9. Starting application..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# 10. Save PM2 configuration
echo "10. Saving PM2 configuration..."
sudo -u $APP_USER pm2 save

# 11. Set up PM2 startup
echo "11. Setting up PM2 startup..."
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# 12. Configure nginx
echo "12. Configuring nginx..."
sudo tee /etc/nginx/sites-available/action-protection << 'EOF'
server {
    listen 80;
    server_name demox.actionprotectionkw.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Main application proxy
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
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Static files
    location /uploads/ {
        alias /home/actionprotection/action-protection/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /assets/ {
        alias /home/actionprotection/action-protection/client/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

# 13. Enable nginx site
echo "13. Enabling nginx site..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/action-protection /etc/nginx/sites-enabled/

# 14. Test and restart nginx
echo "14. Testing and restarting nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 15. Wait for startup
echo "15. Waiting for application startup..."
sleep 15

# 16. Test application
echo "16. Testing application..."
echo "Port 4000 test:"
curl -s http://localhost:4000/api/categories -w "HTTP Status: %{http_code}\n" | head -3

echo "Nginx proxy test:"
curl -s http://localhost/api/categories -w "HTTP Status: %{http_code}\n" | head -3

echo "Admin login test:"
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "HTTP Status: %{http_code}\n"

# 17. Show final status
echo "17. Final status:"
sudo -u $APP_USER pm2 list
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l | head -5

echo ""
echo "✅ Production setup completed!"
echo ""
echo "🌐 Access URLs:"
echo "   - Website: http://demox.actionprotectionkw.com"
echo "   - Admin: http://demox.actionprotectionkw.com/admin"
echo "   - Direct app: http://localhost:4000"
echo ""
echo "🔑 Admin credentials:"
echo "   - Email: admin@actionprotection.com"
echo "   - Password: admin123456"
echo ""
echo "📊 Management commands:"
echo "   - PM2 status: sudo -u actionprotection pm2 list"
echo "   - PM2 logs: sudo -u actionprotection pm2 logs action-protection"
echo "   - Restart app: sudo -u actionprotection pm2 restart action-protection"
echo "   - Nginx logs: sudo tail -f /var/log/nginx/error.log"