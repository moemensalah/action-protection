#!/bin/bash

cd /home/appuser/latelounge

echo "=== SEEDING DATABASE ==="

# Check PM2 logs first
echo "1. Checking PM2 logs for errors:"
pm2 logs --lines 10

echo -e "\n2. Checking if categories table exists and is empty:"
export DATABASE_URL="postgresql://appuser:SAJWJJAHED4E@localhost:5432/latelounge_db"
psql $DATABASE_URL -c "SELECT COUNT(*) as category_count FROM categories;"

echo -e "\n3. Inserting sample categories..."
psql $DATABASE_URL << 'EOF'
INSERT INTO categories (name_en, name_ar, description_en, description_ar, slug, image, is_active) VALUES
('Hot Drinks', 'المشروبات الساخنة', 'Fresh coffee and tea selections', 'مجموعة متنوعة من القهوة والشاي الطازج', 'hot-drinks', '/uploads/hot-drinks.jpg', true),
('Cold Drinks', 'المشروبات الباردة', 'Refreshing cold beverages', 'مشروبات باردة منعشة', 'cold-drinks', '/uploads/cold-drinks.jpg', true),
('Desserts', 'الحلويات', 'Sweet treats and desserts', 'حلويات ومعجنات حلوة', 'desserts', '/uploads/desserts.jpg', true),
('Snacks', 'الوجبات الخفيفة', 'Light meals and snacks', 'وجبات خفيفة ومقبلات', 'snacks', '/uploads/snacks.jpg', true)
ON CONFLICT (slug) DO NOTHING;
EOF

echo -e "\n4. Inserting sample products..."
psql $DATABASE_URL << 'EOF'
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, category_id, image, is_active, is_featured, is_available) VALUES
('Espresso', 'إسبريسو', 'Strong Italian coffee', 'قهوة إيطالية قوية', 15.00, 1, '/uploads/espresso.jpg', true, true, true),
('Cappuccino', 'كابتشينو', 'Coffee with steamed milk foam', 'قهوة مع رغوة الحليب المبخر', 18.00, 1, '/uploads/cappuccino.jpg', true, true, true),
('Iced Coffee', 'قهوة مثلجة', 'Cold brew coffee with ice', 'قهوة باردة مع الثلج', 20.00, 2, '/uploads/iced-coffee.jpg', true, false, true),
('Chocolate Cake', 'كيك الشوكولاتة', 'Rich chocolate dessert', 'حلوى الشوكولاتة الغنية', 25.00, 3, '/uploads/chocolate-cake.jpg', true, true, true);
EOF

echo -e "\n5. Verifying data insertion:"
psql $DATABASE_URL -c "SELECT COUNT(*) as category_count FROM categories;"
psql $DATABASE_URL -c "SELECT COUNT(*) as product_count FROM products;"

echo -e "\n6. Testing API after seeding:"
curl -s http://localhost:3000/api/categories | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/categories

echo -e "\n=== SEEDING COMPLETE ==="