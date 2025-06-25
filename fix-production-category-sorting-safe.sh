#!/bin/bash

echo "🔧 LateLounge Production Category Sorting Safe Fix"
echo "================================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

echo "📋 Checking current category sorting state..."
psql "$DATABASE_URL" -c "SELECT id, name_en, sort_order FROM categories ORDER BY sort_order, id;"

echo ""
echo "🔍 Checking for sort_order issues..."

# Check if sort_order column exists
SORT_ORDER_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order';" | tr -d ' ')

if [ "$SORT_ORDER_EXISTS" = "0" ]; then
    echo "❌ sort_order column missing. Adding it..."
    psql "$DATABASE_URL" -c "ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;"
fi

# Check for duplicate sort_order values
DUPLICATES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM (SELECT sort_order FROM categories GROUP BY sort_order HAVING COUNT(*) > 1) duplicates;" | tr -d ' ')

if [ "$DUPLICATES" -gt "0" ]; then
    echo "⚠️  Found duplicate sort_order values. Fixing..."
    psql "$DATABASE_URL" -c "
        WITH ordered_categories AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order, id) as new_order
            FROM categories
        )
        UPDATE categories 
        SET sort_order = ordered_categories.new_order,
            updated_at = NOW()
        FROM ordered_categories 
        WHERE categories.id = ordered_categories.id;
    "
    echo "✅ Fixed duplicate sort_order values"
else
    echo "✅ No duplicate sort_order values found"
fi

# Check for NULL sort_order values
NULL_ORDERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM categories WHERE sort_order IS NULL;" | tr -d ' ')

if [ "$NULL_ORDERS" -gt "0" ]; then
    echo "⚠️  Found NULL sort_order values. Fixing..."
    psql "$DATABASE_URL" -c "
        WITH max_order AS (
            SELECT COALESCE(MAX(sort_order), 0) as max_val FROM categories WHERE sort_order IS NOT NULL
        ),
        ordered_nulls AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) + max_order.max_val as new_order
            FROM categories, max_order
            WHERE sort_order IS NULL
        )
        UPDATE categories 
        SET sort_order = ordered_nulls.new_order,
            updated_at = NOW()
        FROM ordered_nulls 
        WHERE categories.id = ordered_nulls.id;
    "
    echo "✅ Fixed NULL sort_order values"
else
    echo "✅ No NULL sort_order values found"
fi

# Normalize sort_order to start from 1 and be sequential
echo "🔄 Normalizing sort_order values to be sequential..."
psql "$DATABASE_URL" -c "
    WITH ordered_categories AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order, id) as new_order
        FROM categories
    )
    UPDATE categories 
    SET sort_order = ordered_categories.new_order,
        updated_at = NOW()
    FROM ordered_categories 
    WHERE categories.id = ordered_categories.id;
"

echo ""
echo "📋 Final category sorting state:"
psql "$DATABASE_URL" -c "SELECT id, name_en, sort_order FROM categories ORDER BY sort_order;"

echo ""
echo "🚀 Restarting PM2 application..."
pm2 restart latelounge

echo ""
echo "📊 Checking PM2 status..."
pm2 status

echo ""
echo "✅ Category sorting fix complete!"
echo ""
echo "🔍 Test the category sorting in admin panel:"
echo "   1. Go to admin panel > Categories"
echo "   2. Use up/down arrows to reorder categories"
echo "   3. Check if changes persist after page refresh"
echo "   4. Verify website shows categories in correct order"