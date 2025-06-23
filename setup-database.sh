#!/bin/bash

cd /home/appuser/latelounge

echo "=== DATABASE SETUP ==="

# Test database connection
echo "1. Testing database connection:"
export DATABASE_URL="postgresql://latelounge_user:secure_password123@localhost:5432/latelounge_db"
psql $DATABASE_URL -c "SELECT version();" 2>/dev/null && echo "✓ Database connection OK" || echo "✗ Database connection failed"

# Run database migrations
echo "2. Running database migrations:"
npm run db:push

# Check if tables exist
echo "3. Checking database tables:"
psql $DATABASE_URL -c "\dt" 2>/dev/null

# Seed database with initial data
echo "4. Seeding database:"
npm run db:seed 2>/dev/null || echo "No seed script found"

echo "=== DATABASE SETUP COMPLETE ==="