#!/bin/bash

echo "🔧 Quick Category Sorting Fix"
echo "============================="

# Simple database update using npm run db:push
echo "📋 Pushing latest database schema..."
npm run db:push

echo "🔄 Ensuring sort_order values are set..."
psql "$DATABASE_URL" -c "
UPDATE categories 
SET sort_order = CASE 
  WHEN sort_order IS NULL OR sort_order = 0 THEN id 
  ELSE sort_order 
END;
"

echo "📋 Current categories with sort order:"
psql "$DATABASE_URL" -c "SELECT id, name_en, sort_order FROM categories ORDER BY sort_order, id;"

echo "🚀 Restarting PM2..."
pm2 restart latelounge

echo "✅ Fix complete! Test category sorting in admin panel."