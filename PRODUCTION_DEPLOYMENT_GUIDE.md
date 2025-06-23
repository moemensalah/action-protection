# LateLounge Production Deployment Guide

## Critical Fixes Included

This deployment script incorporates all the issues we resolved:

### 1. Directory Permissions Fix
```bash
sudo chmod o+x /home/appuser/
```
**Critical**: Without this, nginx cannot traverse the directory to serve static files.

### 2. Database Driver Configuration
- Uses standard PostgreSQL driver instead of Neon serverless
- Configures local PostgreSQL with proper authentication
- Sets up database user and permissions

### 3. PM2 Configuration
- Uses `.cjs` extension for ecosystem config (ES module compatibility)
- Proper process management and logging

### 4. Nginx Asset Serving
- Maps `/assets/` requests to `/dist/public/assets/` filesystem location
- Configures both HTTP and HTTPS servers
- Proper SSL certificate generation
- Fixed directory permissions for www-data access

### 5. File Permissions
- Sets proper ownership: `www-data:www-data` for dist files
- Directory permissions: `755` for traversal
- File permissions: `644` for reading

## Deployment Instructions

1. **Run the deployment script on Ubuntu 22.04 server:**
```bash
wget https://your-repo/complete-deployment-script.sh
chmod +x complete-deployment-script.sh
sudo ./complete-deployment-script.sh
```

2. **Verify deployment:**
```bash
# Check PM2 status
sudo -u appuser pm2 status

# Test API
curl https://demo2.late-lounge.com/api/categories

# Test assets
curl -I https://demo2.late-lounge.com/assets/index-D9yNFWBb.css
```

## Key Configuration Changes

### Database Connection
```javascript
// Uses standard pg driver instead of @neondatabase/serverless
import { Pool } from 'pg';
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

### PM2 Ecosystem (ecosystem.config.cjs)
```javascript
module.exports = {
  apps: [{
    name: 'latelounge',
    script: 'dist/index.js',
    // ES module compatibility with .cjs extension
  }]
};
```

### Nginx Configuration
```nginx
# Critical asset mapping
location /assets/ {
    alias /home/appuser/latelounge/dist/public/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}
```

## Troubleshooting

### Blank Page Issues
1. Check directory permissions: `sudo chmod o+x /home/appuser/`
2. Verify asset permissions: `ls -la /home/appuser/latelounge/dist/public/assets/`
3. Test nginx config: `sudo nginx -t`

### Database Connection Issues
1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Test connection: `psql -U appuser -d latelounge -h localhost`
3. Verify environment variables: `cat .env`

### PM2 Issues
1. Check logs: `sudo -u appuser pm2 logs`
2. Restart app: `sudo -u appuser pm2 restart latelounge`
3. Verify ecosystem config: `node -c ecosystem.config.cjs`

## Security Considerations

- Uses self-signed SSL certificates (replace with Let's Encrypt in production)
- Database credentials stored in environment variables
- Nginx security headers configured
- File permissions follow least-privilege principle

## Performance Optimizations

- Gzip compression enabled
- Static asset caching (1 year expiry)
- HTTP/2 support
- Asset optimization through Vite build process