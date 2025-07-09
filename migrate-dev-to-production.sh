#!/bin/bash

# ========================================================================
# Full Database Migration from Dev to Production
# ========================================================================
# This script exports the development database and imports it to production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
BACKUP_DIR="/tmp/db_migration_$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting Full Database Migration from Dev to Production..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Export development database schema and data
echo "2. Exporting development database..."
sudo -u $APP_USER NODE_ENV=development node -e "
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function exportDatabase() {
  console.log('Connecting to development database...');
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  const tables = [
    'users',
    'website_users', 
    'categories',
    'products',
    'about_us',
    'contact_us',
    'footer_content',
    'widget_settings',
    'privacy_policy',
    'terms_of_service',
    'smtp_settings',
    'user_addresses',
    'orders',
    'order_items',
    'hero_section',
    'experience_section',
    'customer_reviews',
    'review_settings',
    'user_permissions',
    'ai_settings'
  ];
  
  console.log('Exporting tables:', tables.join(', '));
  
  for (const table of tables) {
    try {
      const result = await sql(\`SELECT * FROM \${table} ORDER BY id\`);
      fs.writeFileSync('$BACKUP_DIR/\${table}.json', JSON.stringify(result, null, 2));
      console.log(\`✅ Exported \${table}: \${result.length} rows\`);
    } catch (error) {
      console.log(\`⚠️  Table \${table} not found or empty: \${error.message}\`);
      fs.writeFileSync('$BACKUP_DIR/\${table}.json', JSON.stringify([], null, 2));
    }
  }
  
  console.log('Development database export completed!');
}

exportDatabase().catch(console.error);
" || echo "Development export completed with some warnings"

# Create production database restore script
echo "3. Creating production database restore script..."
sudo -u $APP_USER cat > $BACKUP_DIR/restore-to-production.js << 'EOF'
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
  console.log('🔄 Restoring database to production...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  // Clear existing tables (in correct order to avoid foreign key constraints)
  console.log('Clearing existing production data...');
  const clearTables = [
    'order_items',
    'orders', 
    'user_addresses',
    'user_permissions',
    'customer_reviews',
    'products',
    'categories',
    'website_users',
    'users',
    'about_us',
    'contact_us',
    'footer_content',
    'widget_settings',
    'privacy_policy',
    'terms_of_service',
    'smtp_settings',
    'hero_section',
    'experience_section',
    'review_settings',
    'ai_settings'
  ];
  
  for (const table of clearTables) {
    try {
      await sql(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${table}: ${error.message}`);
    }
  }
  
  // Restore data (in correct order)
  const restoreTables = [
    'users',
    'website_users',
    'categories',
    'products',
    'about_us',
    'contact_us',
    'footer_content',
    'widget_settings',
    'privacy_policy',
    'terms_of_service',
    'smtp_settings',
    'user_addresses',
    'orders',
    'order_items',
    'hero_section',
    'experience_section',
    'customer_reviews',
    'review_settings',
    'user_permissions',
    'ai_settings'
  ];
  
  for (const table of restoreTables) {
    try {
      const dataFile = `${table}.json`;
      if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        if (data.length > 0) {
          // Get column names from first row
          const columns = Object.keys(data[0]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const columnList = columns.join(', ');
          
          for (const row of data) {
            const values = columns.map(col => row[col]);
            await sql(`INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`, values);
          }
          
          console.log(`✅ Restored ${table}: ${data.length} rows`);
        } else {
          console.log(`⚠️  No data to restore for ${table}`);
        }
      } else {
        console.log(`⚠️  Data file not found for ${table}`);
      }
    } catch (error) {
      console.log(`❌ Error restoring ${table}: ${error.message}`);
    }
  }
  
  console.log('🎉 Database restoration completed!');
}

restoreDatabase().catch(console.error);
EOF

# Run the production restore
echo "4. Restoring data to production database..."
cd $BACKUP_DIR
sudo -u $APP_USER NODE_ENV=production node restore-to-production.js

# Run database migrations to ensure schema is up to date
echo "5. Running database migrations..."
cd $PROJECT_DIR
sudo -u $APP_USER npm run db:push

# Rebuild application
echo "6. Rebuilding application..."
sudo -u $APP_USER npm run build

# Start PM2 processes
echo "7. Starting PM2 processes..."
sudo -u $APP_USER pm2 start ecosystem.config.cjs --env production

# Wait for startup
echo "8. Waiting for application startup..."
sleep 15

# Test admin login
echo "9. Testing admin login..."
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    > /tmp/migration_test.json

echo "Migration test result:"
cat /tmp/migration_test.json

# Check if successful
if grep -q "Admin login successful" /tmp/migration_test.json; then
    echo ""
    echo "✅ SUCCESS: Full database migration completed!"
    echo ""
    echo "Admin login credentials:"
    echo "  Email: admin@actionprotection.com"
    echo "  Password: admin123456"
    echo "  URL: https://demox.actionprotectionkw.com/admin"
else
    echo ""
    echo "❌ Migration completed but admin login test failed"
    echo "Check the logs above for any errors"
fi

# Show final status
echo ""
echo "10. Final system status:"
sudo -u $APP_USER pm2 list

# Clean up
echo ""
echo "11. Cleaning up temporary files..."
rm -rf $BACKUP_DIR

echo ""
echo "🎉 Database migration from development to production completed!"
echo "All users, products, categories, and settings have been migrated."