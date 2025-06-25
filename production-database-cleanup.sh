#!/bin/bash

# Production Database Cleanup Script
# Run this on production server to identify and clean ghost products

set -e

echo "🧹 LateLounge Production Database Cleanup"
echo "========================================"

# Database connection details
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_NAME="${PGDATABASE:-latelounge_db}"
DB_USER="${PGUSER:-latelounge_user}"

echo "📊 Analyzing database for ghost products..."

# Create a backup first
echo "📦 Creating backup before cleanup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "backup_$(date +%Y%m%d_%H%M%S).sql"

# Run analysis queries
echo "🔍 Identifying problematic products..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f production-cleanup.sql

echo ""
echo "⚠️  IMPORTANT: Review the output above before proceeding"
echo "💡 To remove ghost products, manually run:"
echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo "   Then execute: DELETE FROM products WHERE id IN (specific_ids);"
echo ""
echo "🔧 After cleanup, restart your application:"
echo "   pm2 restart latelounge-cafe"
echo ""
echo "✅ Cleanup analysis complete. Backup saved."