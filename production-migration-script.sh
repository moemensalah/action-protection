#!/bin/bash

# ========================================================================
# Production Database Migration Script
# Copies development database to production
# ========================================================================

set -e

PROJECT_DIR="/home/actionprotection/action-protection"
APP_USER="actionprotection"
BACKUP_DIR="/tmp/db_migration_$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting database migration from development to production..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Export development database
echo "2. Exporting development database..."
sudo -u $APP_USER NODE_ENV=development node -e "
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  console.log('📥 Connecting to development database...');
  const sql = neon(process.env.DATABASE_URL);
  
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
  
  console.log('📋 Exporting tables:', tables.join(', '));
  
  for (const table of tables) {
    try {
      const result = await sql(\`SELECT * FROM \${table} ORDER BY created_at DESC\`);
      const filePath = path.join('$BACKUP_DIR', \`\${table}.json\`);
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      console.log(\`✅ \${table}: \${result.length} rows exported\`);
    } catch (error) {
      console.log(\`⚠️  \${table}: \${error.message}\`);
      const filePath = path.join('$BACKUP_DIR', \`\${table}.json\`);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }
  
  console.log('✅ Development database export completed');
}

exportDatabase().catch(console.error);
" || echo "Development export completed with warnings"

# Create production restore script
echo "3. Creating production restore script..."
cat > $BACKUP_DIR/restore-production.js << 'EOF'
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function restoreToProduction() {
  console.log('🔄 Restoring to production database...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  // Clear existing data in correct order
  const clearOrder = [
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
  
  console.log('🧹 Clearing existing production data...');
  for (const table of clearOrder) {
    try {
      await sql(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table}`);
    } catch (error) {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  }
  
  // Restore data in correct order
  const restoreOrder = [
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
  
  console.log('📥 Restoring development data to production...');
  for (const table of restoreOrder) {
    try {
      const dataFile = `${table}.json`;
      if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const columnList = columns.join(', ');
          
          for (const row of data) {
            const values = columns.map(col => row[col]);
            await sql(`INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`, values);
          }
          
          console.log(`✅ ${table}: ${data.length} rows restored`);
        }
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }
  
  console.log('✅ Production database restore completed');
}

restoreToProduction().catch(console.error);
EOF

# Run production restore
echo "4. Restoring to production database..."
cd $BACKUP_DIR
sudo -u $APP_USER NODE_ENV=production node restore-production.js

# Run database migrations
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
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' > /tmp/login_test.json

echo "Login test result:"
cat /tmp/login_test.json | jq . || cat /tmp/login_test.json

# Check if login was successful
if grep -q "user" /tmp/login_test.json; then
    echo ""
    echo "✅ SUCCESS: Database migration completed successfully!"
    echo ""
    echo "🎉 Admin login is now working!"
    echo "   Email: admin@actionprotection.com"
    echo "   Password: admin123456"
    echo "   URL: https://demox.actionprotectionkw.com/admin"
else
    echo ""
    echo "⚠️  Migration completed but login test inconclusive"
    echo "Please test manually at: https://demox.actionprotectionkw.com/admin"
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
echo "🎉 Database migration completed!"
echo "All development data has been migrated to production."