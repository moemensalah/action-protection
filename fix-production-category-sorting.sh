#!/bin/bash

echo "🔧 LateLounge Production Category Sorting Fix"
echo "============================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

echo "📋 Checking category sort_order column..."
SORT_ORDER_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order';" | tr -d ' ')

if [ "$SORT_ORDER_EXISTS" = "0" ]; then
    echo "❌ sort_order column missing. Adding it..."
    psql "$DATABASE_URL" -c "ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;"
    
    echo "🔄 Setting initial sort_order values..."
    psql "$DATABASE_URL" -c "
        WITH ordered_categories AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) as new_order
            FROM categories
        )
        UPDATE categories 
        SET sort_order = ordered_categories.new_order
        FROM ordered_categories 
        WHERE categories.id = ordered_categories.id;
    "
else
    echo "✅ sort_order column exists"
fi

echo "📋 Current categories with sort order:"
psql "$DATABASE_URL" -c "SELECT id, name_en, name_ar, sort_order FROM categories ORDER BY sort_order, id;"

echo "🚀 Restarting PM2 application..."
pm2 restart latelounge

echo "📊 Checking PM2 status..."
pm2 status

echo "✅ Category sorting fix complete!"
echo ""
echo "🔍 Test the category sorting in admin panel:"
echo "   1. Go to admin panel > Categories"
echo "   2. Use up/down arrows to reorder categories"
echo "   3. Check if changes persist after page refresh"