# Deployment Scripts Guide - Action Protection

## Overview
Comprehensive guide for all deployment and management scripts for Action Protection platform.

## Main Deployment Scripts

### 1. `complete-production-deployment.sh`
**Purpose**: Complete production deployment from scratch
**Use Case**: First-time deployment or complete rebuild

**Features**:
- Automatic user and database creation
- Git repository cloning with fallback
- Dependency installation and build
- PM2 process management setup
- Nginx reverse proxy configuration
- Comprehensive testing and validation

**Usage**:
```bash
# Configure first (optional)
./setup-deployment-config.sh

# Deploy
./complete-production-deployment.sh
```

### 2. `setup-deployment-config.sh`
**Purpose**: Interactive configuration helper
**Use Case**: Set repository URL, domain, and other settings

**Features**:
- Interactive prompts for all settings
- Validates configuration inputs
- Creates backup of original script
- Updates deployment script with your settings

**Usage**:
```bash
./setup-deployment-config.sh
```

### 3. `update-production.sh`
**Purpose**: Update existing production deployment
**Use Case**: Regular updates and code changes

**Features**:
- Git pull with backup creation
- Dependency updates
- Application rebuild
- Service restart
- Automatic testing

**Usage**:
```bash
./update-production.sh
```

## Problem Resolution Scripts

### 4. `quick-fix-current-deployment.sh`
**Purpose**: Fix "vite not found" and build issues
**Use Case**: When deployment fails due to missing build dependencies

**Features**:
- Installs all dependencies (including dev dependencies)
- Rebuilds application
- Removes dev dependencies after build
- Restarts PM2 process
- Tests functionality

**Usage**:
```bash
./quick-fix-current-deployment.sh
```

### 5. `diagnose-deployment.sh`
**Purpose**: Comprehensive deployment diagnosis
**Use Case**: Troubleshooting deployment issues

**Features**:
- Checks project structure
- Validates build outputs
- Tests database connectivity
- Verifies service status
- Provides specific recommendations

**Usage**:
```bash
./diagnose-deployment.sh
```

### 6. `clean-deployment.sh`
**Purpose**: Clean removal of existing deployment
**Use Case**: Starting fresh or removing deployment

**Features**:
- Stops all PM2 processes
- Removes project directory
- Optional database removal
- Cleans nginx configuration
- Prepares for fresh deployment

**Usage**:
```bash
./clean-deployment.sh
```

### 7. `fix-build-dependencies.sh`
**Purpose**: Detailed build dependency fixing
**Use Case**: Comprehensive build issue resolution

**Features**:
- Detailed dependency installation
- Build process validation
- Comprehensive testing
- Build output summary
- Service restart

**Usage**:
```bash
./fix-build-dependencies.sh
```

## Script Selection Guide

### First Time Deployment
1. `./setup-deployment-config.sh` (optional)
2. `./complete-production-deployment.sh`

### Regular Updates
1. `./update-production.sh`

### Build Issues
1. `./quick-fix-current-deployment.sh`
2. If issues persist: `./diagnose-deployment.sh`

### Troubleshooting
1. `./diagnose-deployment.sh`
2. Based on diagnosis: appropriate fix script

### Starting Fresh
1. `./clean-deployment.sh`
2. `./complete-production-deployment.sh`

## Common Error Scenarios

### "vite not found" Error
**Solution**: `./quick-fix-current-deployment.sh`
**Root Cause**: Missing dev dependencies during build

### "Script not found: dist/index.js"
**Solution**: `./quick-fix-current-deployment.sh`
**Root Cause**: Build process failed, no output files

### "Directory already exists"
**Solution**: Run deployment script again (auto-handles)
**Root Cause**: Previous deployment exists

### 502 Bad Gateway
**Solution**: `./diagnose-deployment.sh` then appropriate fix
**Root Cause**: Application not running or build issues

### Database Connection Issues
**Solution**: Check PostgreSQL service, restart if needed
**Root Cause**: Database service not running

## File Locations

### Project Files
- **Main Directory**: `/home/actionprotection/action-protection`
- **Build Output**: `/home/actionprotection/action-protection/dist/`
- **Logs**: `/home/actionprotection/action-protection/logs/`

### Backups
- **Deployment Backups**: `/home/actionprotection/deployment-backups/`
- **Database Backups**: `/home/actionprotection/db-backups/`

### System Files
- **Nginx Config**: `/etc/nginx/sites-available/action-protection`
- **PM2 Config**: `/home/actionprotection/action-protection/ecosystem.config.js`

## Verification Commands

### Check Application Status
```bash
sudo -u actionprotection pm2 list
curl -f http://localhost:4000/api/categories
```

### Check Services
```bash
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Check Build Outputs
```bash
ls -la /home/actionprotection/action-protection/dist/
```

### Check Database
```bash
psql "postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db" -c "SELECT 1;"
```

## Best Practices

1. **Always backup before changes**: Scripts automatically create backups
2. **Test after deployment**: Scripts include automatic testing
3. **Monitor logs**: Use PM2 logs for application monitoring
4. **Regular updates**: Use update script for code changes
5. **Clean deployments**: Use clean script for major issues

## Support

All scripts include:
- Comprehensive error handling
- Automatic testing and validation
- Detailed logging and status reporting
- Backup creation before changes
- Recovery recommendations for failures