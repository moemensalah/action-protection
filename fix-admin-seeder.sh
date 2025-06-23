#!/bin/bash

# Fix the syntax error in the admin seeder
set -e

PROJECT_DIR="/home/appuser/latelounge"
APP_USER="appuser"

# Admin configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"
ADMIN_EMAIL="admin@latelounge.sa"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Administrator"

echo "🔧 Fixing admin seeder syntax error..."

cd $PROJECT_DIR

# Create corrected seeder with proper syntax
sudo -u $APP_USER tee seed-admin-fixed.js << 'EOF'
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log("👤 Creating admin user...");
    
    const hashedPassword = await bcrypt.hash("admin123456", 10);
    await client.query(`
      INSERT INTO users (id, username, email, password, "firstName", "lastName", role, "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (username) DO UPDATE SET 
        email = $3,
        password = $4,
        "firstName" = $5,
        "lastName" = $6,
        role = $7,
        "isActive" = $8
    `, ["admin_user", "admin", "admin@latelounge.sa", hashedPassword, "System", "Administrator", "administrator", true]);

    console.log("✅ Admin user created successfully!");
    console.log("👤 Login credentials:");
    console.log("   Username: admin");  
    console.log("   Password: admin123456");
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    client.release();
  }
}

createAdminUser().then(() => {
  console.log("🎉 Admin setup completed!");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
EOF

# Run the corrected seeder
echo "Running corrected admin seeder..."
sudo -u $APP_USER node seed-admin-fixed.js

echo "✅ Admin user seeder fixed and executed successfully!"
echo "Admin credentials: admin / admin123456"