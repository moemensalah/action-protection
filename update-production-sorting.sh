#!/bin/bash

echo "🔧 LateLounge Production Sorting Update"
echo "======================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

echo "📋 Updating database schema and fixing sorting..."

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

echo ""
echo "📦 Fixing category sorting..."
bash fix-production-category-sorting-safe.sh

echo ""
echo "🔍 Checking product sorting within categories..."
psql "$DATABASE_URL" -c "
SELECT 
    p.id, 
    p.name_en, 
    p.category_id, 
    p.sort_order,
    c.name_en as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY c.sort_order, p.sort_order;
"

echo ""
echo "✅ Production sorting update complete!"
echo ""
echo "📊 Both category and product sorting should now work correctly in production."