#!/bin/bash

# ========================================================================
# Simple Database Export for Production
# ========================================================================

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="action_protection_production_${TIMESTAMP}.sql"

echo "Creating simple database export..."

# Export with minimal options for faster processing
pg_dump $DATABASE_URL \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --inserts \
    > "$DUMP_FILE" 2>/dev/null &

# Wait for completion with timeout
TIMEOUT=30
ELAPSED=0
while kill -0 $! 2>/dev/null; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "Timeout reached, killing process..."
        kill $! 2>/dev/null || true
        break
    fi
    sleep 1
    ELAPSED=$((ELAPSED + 1))
done

if [ -f "$DUMP_FILE" ] && [ -s "$DUMP_FILE" ]; then
    echo "Database export completed: $DUMP_FILE"
    ls -lh "$DUMP_FILE"
    echo ""
    echo "First few lines of the dump:"
    head -20 "$DUMP_FILE"
else
    echo "Export failed or file is empty"
fi