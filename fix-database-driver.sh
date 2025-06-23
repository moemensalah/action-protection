#!/bin/bash

cd /home/appuser/latelounge

echo "=== FIXING DATABASE DRIVER ==="

# Stop PM2
pm2 stop all
pm2 delete all

echo "1. Installing pg driver..."
npm install pg @types/pg

echo "2. Updating database configuration..."
cat > server/db.ts << 'EOF'
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
EOF

echo "3. Rebuilding application..."
npm run build

echo "4. Testing database connection directly..."
export DATABASE_URL="postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db"
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT current_user', (err, res) => {
  if (err) {
    console.log('Database connection failed:', err.message);
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
  pool.end();
});
"

echo "5. Seeding database with sample data..."
psql $DATABASE_URL << 'EOF'
DELETE FROM categories;
INSERT INTO categories (name_en, name_ar, description_en, description_ar, slug, image, is_active) VALUES
('Hot Drinks', 'المشروبات الساخنة', 'Fresh coffee and tea selections', 'مجموعة متنوعة من القهوة والشاي الطازج', 'hot-drinks', '/uploads/hot-drinks.jpg', true),
('Cold Drinks', 'المشروبات الباردة', 'Refreshing cold beverages', 'مشروبات باردة منعشة', 'cold-drinks', '/uploads/cold-drinks.jpg', true),
('Desserts', 'الحلويات', 'Sweet treats and desserts', 'حلويات ومعجنات حلوة', 'desserts', '/uploads/desserts.jpg', true),
('Snacks', 'الوجبات الخفيفة', 'Light meals and snacks', 'وجبات خفيفة ومقبلات', 'snacks', '/uploads/snacks.jpg', true);
EOF

echo "6. Starting PM2 with fixed configuration..."
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "7. Testing API after 10 seconds..."
sleep 10
curl -s http://localhost:3000/api/categories

echo "=== DATABASE DRIVER FIX COMPLETE ==="