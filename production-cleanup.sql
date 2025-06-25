-- Production Database Cleanup Script
-- This script identifies and removes ghost/duplicate products safely

-- First, identify potentially problematic products
-- (products that might be duplicates or have missing data)
SELECT 
  id, 
  name_en, 
  name_ar, 
  category_id, 
  is_active,
  created_at
FROM products 
WHERE 
  name_en IS NULL 
  OR name_ar IS NULL 
  OR category_id IS NULL 
  OR category_id NOT IN (SELECT id FROM categories)
ORDER BY created_at DESC;

-- Show products that might be duplicates (same name in same category)
SELECT 
  p1.id as id1, 
  p2.id as id2,
  p1.name_en,
  p1.category_id,
  p1.created_at as created1,
  p2.created_at as created2
FROM products p1 
JOIN products p2 ON p1.name_en = p2.name_en 
  AND p1.category_id = p2.category_id 
  AND p1.id < p2.id
ORDER BY p1.name_en;

-- Count products per category to identify inconsistencies
SELECT 
  c.name_en as category_name,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name_en
ORDER BY c.sort_order;

-- Total product count
SELECT COUNT(*) as total_products FROM products WHERE is_active = true;

-- CAUTION: Only run the DELETE statements below after reviewing the SELECT results above
-- and confirming which products should be removed

-- Example cleanup (adjust IDs based on your findings):
-- DELETE FROM products WHERE id IN (specific_ids_to_remove);

-- Verify final state
-- SELECT COUNT(*) as final_product_count FROM products WHERE is_active = true;