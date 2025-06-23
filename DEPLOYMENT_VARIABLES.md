# Deployment Configuration Variables

This document explains all the variables in the `auto-deploy.sh` script that can be customized for different deployments.

## Quick Configuration Guide

Before running the deployment script, modify these variables at the top of `auto-deploy.sh`:

### Domain & Project Configuration
```bash
DOMAIN="demo2.late-lounge.com"              # Your primary domain
DOMAIN_WWW="www.demo2.late-lounge.com"      # WWW subdomain
GIT_REPO_URL="https://github.com/your-username/latelounge.git"  # Your Git repository
PROJECT_NAME="latelounge"                    # Project directory name
APP_USER="appuser"                          # System user for the application
NODE_VERSION="20"                           # Node.js version to install
APP_PORT="3000"                             # Application port
```

### Database Configuration
```bash
DB_USER="appuser"                           # PostgreSQL username
DB_PASSWORD="SAJWJJAHED4E"                  # PostgreSQL password
DB_NAME="latelounge"                        # Database name
```

### Admin User Configuration
```bash
ADMIN_USERNAME="admin"                      # Default admin username
ADMIN_PASSWORD="admin123456"                # Default admin password (CHANGE THIS!)
ADMIN_EMAIL="admin@latelounge.sa"           # Admin email address
ADMIN_FIRST_NAME="System"                   # Admin first name
ADMIN_LAST_NAME="Administrator"             # Admin last name
```

### Company Information
```bash
COMPANY_NAME_EN="LateLounge"                # Company name in English
COMPANY_NAME_AR="ليت لاونج"                  # Company name in Arabic
COMPANY_PHONE="+966 11 555 123413335"       # Company phone number
COMPANY_WHATSAPP="+966505551234"            # WhatsApp number
COMPANY_EMAIL="info@latelounge.sa"          # Company email
COMPANY_ADDRESS_EN="123 King Fahd Road, Riyadh, Saudi Arabia"     # Address in English
COMPANY_ADDRESS_AR="123 طريق الملك فهد، الرياض، المملكة العربية السعودية"  # Address in Arabic
COMPANY_HOURS_EN="Sunday - Thursday: 7:00 AM - 11:00 PM"          # Working hours in English
COMPANY_HOURS_AR="الأحد - الخميس: 7:00 ص - 11:00 م"                # Working hours in Arabic
```

### Social Media Links
```bash
SOCIAL_INSTAGRAM="https://instagram.com/latelounge"
SOCIAL_TWITTER="https://twitter.com/latelounge"
SOCIAL_FACEBOOK="https://facebook.com/latelounge"
SOCIAL_SNAPCHAT="https://snapchat.com/add/latelounge"
```

### Logo Assets Configuration
```bash
# Logo file paths (these will be copied to production assets folder)
LOGO_WHITE_PATH="attached_assets/english-white_1750523827323.png"    # White theme logo
LOGO_DARK_PATH="attached_assets/english-dark_1750523791780.png"       # Dark theme logo
LOGO_ARABIC_WHITE_PATH="attached_assets/arabic-white_1750516260877.png"  # Arabic white logo
LOGO_ARABIC_DARK_PATH="attached_assets/arabic-dark_1750516613229.png"    # Arabic dark logo
```

## Deployment Steps

1. **Clone the repository** with your customized code
2. **Edit variables** in `auto-deploy.sh` with your specific values
3. **Make executable**: `chmod +x auto-deploy.sh`
4. **Run deployment**: `sudo ./auto-deploy.sh`

## Security Considerations

- Change `ADMIN_PASSWORD` immediately after deployment
- Use strong database passwords
- Consider using environment-specific Git branches
- Update social media links to your actual accounts

## File Locations After Deployment

- Application: `/home/${APP_USER}/${PROJECT_NAME}/`
- Logs: `/home/${APP_USER}/${PROJECT_NAME}/logs/`
- Uploads: `/home/${APP_USER}/${PROJECT_NAME}/uploads/`
- Nginx config: `/etc/nginx/sites-available/${PROJECT_NAME}`
- PM2 process: Named as `${PROJECT_NAME}`

## Management Commands

After deployment, use these commands (with your configured variables):

```bash
# Check application status
sudo -u ${APP_USER} pm2 status

# View logs
sudo -u ${APP_USER} pm2 logs ${PROJECT_NAME}

# Restart application
sudo -u ${APP_USER} pm2 restart ${PROJECT_NAME}

# Stop application
sudo -u ${APP_USER} pm2 stop ${PROJECT_NAME}
```

## What Gets Deployed

The script automatically:
- Creates system user and sets permissions
- Installs Node.js, PostgreSQL, Nginx, PM2
- Clones your Git repository
- Configures database with local authentication
- Builds the application
- Sets up Nginx with asset mapping
- Seeds database with your company information
- Creates default admin user
- Starts application with PM2
- Tests all endpoints and functionality

All critical fixes discovered during development are included and applied automatically.