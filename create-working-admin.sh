#!/bin/bash

# Create Working Admin User
echo "Creating working admin user..."

# Use Node.js to create proper bcrypt hash
HASH=$(node -e "
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
")

# Update database with proper hash
export PGPASSWORD="ajHQGHgwqhg3ggagdg"
psql -h localhost -U actionprotection -d actionprotection_db -c "
UPDATE users 
SET password = '$HASH'
WHERE email = 'admin@actionprotection.com';
"

echo "Admin user updated successfully!"
echo "Login credentials:"
echo "Email: admin@actionprotection.com"
echo "Password: admin123"
echo "URL: http://demox.actionprotectionkw.com/admin"