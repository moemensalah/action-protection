-- Production Category Cleanup Analysis
-- This script identifies duplicate categories and orphaned products

-- 1. Find duplicate categories (same name)
SELECT 
  name_en,
  name_ar,
  COUNT(*) as duplicate_count,
  string_agg(id::text, ', ') as category_ids
FROM categories 
GROUP BY name_en, name_ar 
HAVING COUNT(*) > 1
ORDER BY name_en;

-- 2. Show all categories with their IDs and product counts
SELECT 
  c.id,
  c.name_en,
  c.name_ar,
  c.slug,
  c.sort_order,
  COUNT(p.id) as product_count,
  c.created_at
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name_en, c.name_ar, c.slug, c.sort_order, c.created_at
ORDER BY c.sort_order, c.id;

-- 3. Find products in duplicate categories
SELECT 
  p.id as product_id,
  p.name_en as product_name,
  p.category_id,
  c.name_en as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.name_en IN (
  SELECT name_en 
  FROM categories 
  GROUP BY name_en 
  HAVING COUNT(*) > 1
)
ORDER BY c.name_en, p.name_en;

-- 4. Show recommended cleanup actions
SELECT 
  'DUPLICATE CATEGORY CLEANUP NEEDED' as action_type,
  name_en as category_name,
  COUNT(*) as duplicate_count
FROM categories 
GROUP BY name_en 
HAVING COUNT(*) > 1;