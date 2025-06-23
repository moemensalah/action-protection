#!/bin/bash

cd /home/appuser/latelounge

echo "=== COMPLETE APPLICATION FIX ==="

# Stop PM2
pm2 stop all
pm2 delete all

echo "1. Rebuilding application..."
npm run build

echo "2. Checking if build files exist:"
ls -la dist/ | head -5

echo "3. Creating corrected ecosystem config..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/appuser/latelounge',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db',
      SESSION_SECRET: '88HX0HZPT223ZNGGV1QJO4IA3GX5H48B',
      REPL_ID: 'krw1cv',
      ISSUER_URL: 'https://replit.com/oidc',
      REPLIT_DOMAINS: 'demo2.late-lounge.com'
    },
    error_file: '/home/appuser/latelounge/logs/err.log',
    out_file: '/home/appuser/latelounge/logs/out.log',
    log_file: '/home/appuser/latelounge/logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

echo "4. Ensuring logs directory exists..."
mkdir -p logs

echo "5. Testing database connection..."
export DATABASE_URL="postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db"
psql $DATABASE_URL -c "SELECT current_user;" > /dev/null 2>&1 && echo "✓ Database OK" || echo "✗ Database connection failed"

echo "6. Seeding database with sample data..."
psql $DATABASE_URL << 'EOF'
INSERT INTO categories (name_en, name_ar, description_en, description_ar, slug, image, is_active) VALUES
('Hot Drinks', 'المشروبات الساخنة', 'Fresh coffee and tea selections', 'مجموعة متنوعة من القهوة والشاي الطازج', 'hot-drinks', '/uploads/hot-drinks.jpg', true),
('Cold Drinks', 'المشروبات الباردة', 'Refreshing cold beverages', 'مشروبات باردة منعشة', 'cold-drinks', '/uploads/cold-drinks.jpg', true),
('Desserts', 'الحلويات', 'Sweet treats and desserts', 'حلويات ومعجنات حلوة', 'desserts', '/uploads/desserts.jpg', true),
('Snacks', 'الوجبات الخفيفة', 'Light meals and snacks', 'وجبات خفيفة ومقبلات', 'snacks', '/uploads/snacks.jpg', true)
ON CONFLICT (slug) DO NOTHING;
EOF

echo "7. Starting PM2..."
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "8. Waiting for application to start..."
sleep 10

echo "9. Testing API..."
curl -s http://localhost:3000/api/categories

echo "10. Testing frontend..."
curl -I http://localhost:3000

echo "=== FIX COMPLETE ==="