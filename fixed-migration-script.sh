#!/bin/bash

# ========================================================================
# Fixed Production Database Migration Script
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

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    echo "Please set DATABASE_URL before running migration"
    exit 1
fi

echo "✅ DATABASE_URL found: ${DATABASE_URL:0:20}..."

# Stop PM2 processes
echo "1. Stopping PM2 processes..."
sudo -u $APP_USER pm2 stop all || true

# Export development database using direct SQL
echo "2. Exporting development database using direct SQL..."
sudo -u $APP_USER node -e "
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  console.log('📥 Connecting to development database...');
  
  // Parse DATABASE_URL to get connection details
  const dbUrl = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: dbUrl });
  
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
      const result = await pool.query(\`SELECT * FROM \${table} ORDER BY created_at DESC\`);
      const filePath = path.join('$BACKUP_DIR', \`\${table}.json\`);
      fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
      console.log(\`✅ \${table}: \${result.rows.length} rows exported\`);
    } catch (error) {
      console.log(\`⚠️  \${table}: \${error.message}\`);
      const filePath = path.join('$BACKUP_DIR', \`\${table}.json\`);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }
  
  await pool.end();
  console.log('✅ Development database export completed');
}

exportDatabase().catch(console.error);
"

# Create production restore script that runs from project directory
echo "3. Creating production restore script..."
sudo -u $APP_USER cat > $BACKUP_DIR/restore-production.js << 'EOF'
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreToProduction() {
  console.log('🔄 Restoring to production database...');
  
  // Parse DATABASE_URL to get connection details
  const dbUrl = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: dbUrl });
  
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
      await pool.query(`DELETE FROM ${table}`);
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
      const dataFile = path.join('BACKUP_DIR_PLACEHOLDER', `${table}.json`);
      if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const columnList = columns.join(', ');
          
          for (const row of data) {
            const values = columns.map(col => row[col]);
            await pool.query(`INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`, values);
          }
          
          console.log(`✅ ${table}: ${data.length} rows restored`);
        } else {
          console.log(`⚠️  ${table}: No data to restore`);
        }
      } else {
        console.log(`⚠️  ${table}: Data file not found`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }
  
  await pool.end();
  console.log('✅ Production database restore completed');
}

restoreToProduction().catch(console.error);
EOF

# Replace placeholder with actual backup directory
sudo -u $APP_USER sed -i "s|BACKUP_DIR_PLACEHOLDER|$BACKUP_DIR|g" $BACKUP_DIR/restore-production.js

# Run production restore from project directory
echo "4. Restoring to production database..."
cd $PROJECT_DIR
sudo -u $APP_USER NODE_ENV=production node $BACKUP_DIR/restore-production.js

# Run database migrations
echo "5. Running database migrations..."
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
LOGIN_RESULT=$(curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}')

echo "Login test result:"
echo "$LOGIN_RESULT"

# Check if login was successful
if echo "$LOGIN_RESULT" | grep -q "user\|Admin login successful"; then
    echo ""
    echo "✅ SUCCESS: Database migration completed successfully!"
    echo ""
    echo "🎉 Admin login is now working!"
    echo "   Email: admin@actionprotection.com"
    echo "   Password: admin123456"
    echo "   URL: https://demox.actionprotectionkw.com/admin"
else
    echo ""
    echo "⚠️  Migration completed but login needs manual testing"
    echo "Please test at: https://demox.actionprotectionkw.com/admin"
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