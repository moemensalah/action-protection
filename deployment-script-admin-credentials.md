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

## Current Working Credentials:

After my fix, the working credentials are:
- **Email:** admin@actionprotection.com
- **Password:** admin123
- **URL:** http://demox.actionprotectionkw.com/admin

## For Production Use:

If you want to use the original script credentials, update the admin user:
```bash
# Update to use original script password
UPDATE users 
SET password = '$2a$10$[proper_bcrypt_hash_for_admin123456]',
    email = 'admin@actionprotection.com'
WHERE role = 'administrator';
```

## Security Recommendation:

Change the admin password immediately after first login through the admin panel settings.