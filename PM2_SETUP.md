# PM2 Production Setup for LateLounge Cafe

## Quick Setup Commands

```bash
# 1. Build the application
npm run build

# 2. Install PM2 globally (if not installed)
npm install -g pm2

# 3. Start the application with PM2
pm2 start ecosystem.config.js --env production

# 4. Save PM2 configuration for auto-restart
pm2 save
pm2 startup
```

## PM2 Management Commands

```bash
# Check status
pm2 status
pm2 list

# View logs
pm2 logs latelounge-cafe
pm2 logs --lines 100

# Restart application
pm2 restart latelounge-cafe

# Stop application
pm2 stop latelounge-cafe

# Delete application from PM2
pm2 delete latelounge-cafe

# Monitor resources
pm2 monit

# Reload without downtime
pm2 reload latelounge-cafe
```

## Directory Structure for Production

```
/var/www/latelounge/
├── dist/                 # Built client files
├── server/              # Server source
├── ecosystem.config.js  # PM2 configuration
├── package.json
└── logs/               # PM2 logs (auto-created)
```

## Environment Setup

Create `.env` file or set environment variables:
```bash
NODE_ENV=production
PORT=5000
```

## Nginx Configuration (Optional)

If using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve static files directly
    location /assets/ {
        root /var/www/latelounge/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve React app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues:

1. **404 on API routes**: Ensure server registers API routes before static files
2. **Port conflicts**: Check if port 5000 is available
3. **Memory issues**: Adjust `max_memory_restart` in ecosystem.config.js
4. **Permission errors**: Ensure proper file permissions

### Debug Commands:

```bash
# Check if process is running
pm2 list

# View detailed logs
pm2 logs latelounge-cafe --lines 50

# Test API directly
curl http://localhost:5000/api/categories

# Check Node.js process
ps aux | grep node
```

## Auto-Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash
cd /var/www/latelounge
git pull origin main
npm install
npm run build
pm2 reload ecosystem.config.js --env production
pm2 save
echo "Deployment complete!"
```