#!/bin/bash

# ========================================================================
# Create PostgreSQL Database Dump
# ========================================================================

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="action_protection_db_dump_${TIMESTAMP}.sql"

echo "Creating PostgreSQL database dump..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set, using default connection"
    DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
fi

echo "Using DATABASE_URL: ${DATABASE_URL:0:30}..."

# Create dump with structure and data
pg_dump "$DATABASE_URL" \
    --verbose \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --create \
    --inserts \
    --column-inserts \
    > "$DUMP_FILE"

# Create dump with just structure (no data)
pg_dump "$DATABASE_URL" \
    --verbose \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --create \
    --schema-only \
    > "action_protection_schema_only_${TIMESTAMP}.sql"

# Create dump with just data (no structure)
pg_dump "$DATABASE_URL" \
    --verbose \
    --no-owner \
    --no-privileges \
    --data-only \
    --inserts \
    --column-inserts \
    > "action_protection_data_only_${TIMESTAMP}.sql"

echo "Database dumps created:"
echo "  - Full dump: $DUMP_FILE"
echo "  - Schema only: action_protection_schema_only_${TIMESTAMP}.sql"
echo "  - Data only: action_protection_data_only_${TIMESTAMP}.sql"

# Show file sizes
ls -lh action_protection_*_${TIMESTAMP}.sql

# Show summary of tables
echo ""
echo "Database summary:"
psql "$DATABASE_URL" -c "\dt" || echo "Could not connect to show tables"

echo ""
echo "Dump files ready for download or deployment!"