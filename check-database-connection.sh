#!/bin/bash

# ========================================================================
# Check Database Connection and Environment
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"

echo "🔍 Checking database connection and environment..."

cd $PROJECT_DIR

# Check PM2 environment variables
echo "1. Checking PM2 environment variables..."
sudo -u $APP_USER pm2 show action-protection | grep -A 20 "env:" || echo "No PM2 process found"

# Check system environment
echo ""
echo "2. Checking system environment..."
echo "USER: $(whoami)"
echo "HOME: $HOME"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

# Test database connection
echo ""
echo "3. Testing database connection..."
sudo -u $APP_USER node -e "
const { Pool } = require('pg');

async function testConnection() {
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    
    console.log('Testing connection...');
    const result = await pool.query('SELECT version()');
    console.log('✅ Database connection successful');
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0]);
    
    // Test users table
    const usersTest = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table accessible, count:', usersTest.rows[0].count);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection string format:', process.env.DATABASE_URL?.split('@')[1] || 'Not found');
  }
}

testConnection();
"

echo ""
echo "4. Checking PostgreSQL service..."
systemctl status postgresql --no-pager -l || echo "PostgreSQL service info not available"

echo ""
echo "5. Checking if PostgreSQL is running..."
sudo -u postgres psql -c "SELECT version();" || echo "Direct PostgreSQL connection failed"

echo ""
echo "✅ Database connection check completed!"