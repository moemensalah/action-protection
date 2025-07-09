# Admin Credentials from Full Deployment Script

## Original Script Credentials (from complete-working-deployment.sh):

**Location in script:** Lines 39-44

```bash
# Admin User Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123456"  # CHANGE THIS IMMEDIATELY
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Administrator"
```

## The Issue with Login:

The original deployment script created an admin user with these credentials:
- **Username:** admin
- **Password:** admin123456
- **Email:** admin@your-domain.com

## Why Login Failed:

1. **Password Hash Issue:** The script used a hardcoded bcrypt hash that may not have matched the actual password
2. **Email Domain:** The email was set to "admin@your-domain.com" instead of your actual domain
3. **Database Conflicts:** Multiple admin users existed in the database

## ✅ PRODUCTION DEPLOYMENT SCRIPT FIXED:

I've fixed the `complete-working-deployment.sh` script with the correct password hash:

**Changes Made:**
1. **Fixed bcrypt hash** - Updated the hardcoded hash to match password "admin123456"
2. **Fixed email domain** - Changed from "admin@your-domain.com" to "admin@actionprotection.com"

**Working Credentials (from deployment script):**
- **Email:** admin@actionprotection.com
- **Password:** admin123456
- **URL:** https://demox.actionprotectionkw.com/admin

## Quick Fix for Existing Production:

If you've already deployed and need to fix the admin login immediately, run this on your Ubuntu server:

```bash
# Download and run the fix script
wget https://your-repo/fix-production-admin-login.sh
chmod +x fix-production-admin-login.sh
sudo ./fix-production-admin-login.sh
```

Or manually update the database:
```bash
# Connect to PostgreSQL
sudo -u postgres psql -d actionprotection_db

# Update admin user
UPDATE users 
SET password = '$2b$10$.JPATlNSGmefInSXAlToIeJ9bAM7EjpDiFeUhHuTyO3T0XxDkfUdu',
    email = 'admin@actionprotection.com'
WHERE role = 'administrator';
```

## Security Recommendation:

Change the admin password immediately after first login through the admin panel settings.