# Production Ghost Product Cleanup Guide

## Overview
This guide walks you through safely identifying and removing ghost/duplicate products in production.

## Prerequisites
- SSH access to production server
- Database credentials (PGHOST, PGPORT, PGUSER, PGDATABASE)
- PM2 running the LateLounge application

## Step 1: Connect to Production Server
```bash
ssh your-production-server
cd /path/to/latelounge
```

## Step 2: Run Analysis (Safe - Read Only)
```bash
# Make the script executable
chmod +x production-database-cleanup.sh

# Run analysis to identify ghost products
./production-database-cleanup.sh
```

This will:
- Create an automatic backup
- Show problematic products (missing data, duplicates)
- Display product counts per category
- Show total product count

## Step 3: Review Analysis Results
Look for:
- Products with NULL names or categories
- Duplicate products (same name in same category)
- Products with invalid category IDs
- Inconsistent product counts

Example output:
```
id | name_en | category_id | created_at
---+---------+-------------+-----------
25 | NULL    | 1          | 2025-06-25
26 | Latte   | 1          | 2025-06-25  (duplicate)
27 | Latte   | 1          | 2025-06-25  (duplicate)
```

## Step 4: Manual Database Connection (If Cleanup Needed)
```bash
# Connect to database
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE
```

## Step 5: Execute Cleanup Commands
Based on your analysis, remove specific problematic products:

```sql
-- Example: Remove products with NULL names
DELETE FROM products WHERE name_en IS NULL;

-- Example: Remove specific duplicate IDs (keep the oldest)
DELETE FROM products WHERE id IN (26, 27);

-- Verify cleanup
SELECT COUNT(*) as final_count FROM products WHERE is_active = true;

-- Exit database
\q
```

## Step 6: Restart Application
```bash
# Restart PM2 to refresh cache
pm2 restart latelounge-cafe

# Check application status
pm2 status
pm2 logs latelounge-cafe --lines 20
```

## Step 7: Verify Results
1. Check admin panel - product counts should match
2. Check website - no ghost products should appear
3. Test product editing - should work without duplicates

## Alternative: TypeScript Cleanup Tool
For a safer automated approach:

```bash
# Dry run (preview only)
tsx server/maintenance/cleanupGhostProducts.ts

# Execute cleanup (after reviewing dry run)
tsx server/maintenance/cleanupGhostProducts.ts --execute
```

## Safety Notes
- Always run analysis first
- Backup is created automatically
- Start with small deletions
- Test on staging environment if available
- Monitor application logs after cleanup

## Rollback (If Issues)
```bash
# Restore from backup if needed
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE < backup_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 restart latelounge-cafe
```