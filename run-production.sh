#!/bin/bash

# ========================================================================
# Run Action Protection in Production Mode
# ========================================================================

set -e

echo "🚀 Starting Action Protection in production mode..."

# Stop development server
echo "1. Stopping development server..."
pkill -f "tsx server/index.ts" || true
pkill -f "vite" || true

# Set production environment
export NODE_ENV=production
export PORT=4000

# Build the application
echo "2. Building application..."
npm run build

# Run database migrations
echo "3. Running database migrations..."
npm run db:push

# Create admin user if not exists
echo "4. Ensuring admin user exists..."
node -e "
const { db } = require('./server/db.ts');
const bcrypt = require('bcryptjs');

async function ensureAdminUser() {
  try {
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@actionprotection.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      await db.insert(users).values({
        id: 'admin_user_production',
        email: 'admin@actionprotection.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'administrator',
        isActive: true
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.log('⚠️ Admin user creation:', error.message);
  }
}

ensureAdminUser();
"

# Start production server
echo "5. Starting production server on port 4000..."
NODE_ENV=production PORT=4000 node --loader tsx server/index.ts &

# Wait for server to start
echo "6. Waiting for server startup..."
sleep 10

# Test server endpoints
echo "7. Testing server endpoints..."

echo "Testing categories endpoint:"
curl -s http://localhost:4000/api/categories -w "\nHTTP Status: %{http_code}\n" | head -3

echo "Testing products endpoint:"
curl -s http://localhost:4000/api/products -w "\nHTTP Status: %{http_code}\n" | head -3

echo "Testing hero section:"
curl -s http://localhost:4000/api/hero-section -w "\nHTTP Status: %{http_code}\n" | head -3

echo "Testing admin login:"
curl -s -X POST http://localhost:4000/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@actionprotection.com","password":"admin123456"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo "Testing website user registration:"
curl -s -X POST http://localhost:4000/api/auth/local/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","username":"testuser","password":"test123","firstName":"Test","lastName":"User"}' \
    -w "\nHTTP Status: %{http_code}\n"

echo "Testing static files:"
curl -s -I http://localhost:4000/ -w "\nHTTP Status: %{http_code}\n"

# Show server process
echo "8. Server process status:"
ps aux | grep "node.*server" | grep -v grep || echo "No server process found"

# Show port usage
echo "9. Port 4000 status:"
netstat -tulpn | grep :4000 || echo "Port 4000 not in use"

echo ""
echo "✅ Production mode testing completed!"
echo ""
echo "🌐 Access URLs:"
echo "   - Website: http://localhost:4000"
echo "   - Admin: http://localhost:4000/admin"
echo ""
echo "🔑 Admin credentials:"
echo "   - Email: admin@actionprotection.com"
echo "   - Password: admin123456"
echo ""
echo "📊 To stop the server:"
echo "   - pkill -f 'node.*server'"