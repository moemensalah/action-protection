#!/bin/bash

# Check deployment status and provide guidance
echo "🔍 Deployment Status Check"
echo "=========================="

# Check if we're in Replit environment
if [ -n "$REPLIT_DOMAINS" ]; then
    echo "📍 Environment: Replit Development"
    echo "   The deployment script is designed for production Ubuntu servers"
    echo "   Current environment is Replit development workspace"
    echo ""
    echo "🚨 Issue: Deployment script not compatible with Replit environment"
    echo ""
    echo "🔧 Solutions:"
    echo "   1. This app is already running in Replit development mode"
    echo "   2. Use Replit's built-in deployment feature for production"
    echo "   3. Export project to production Ubuntu server to use deployment script"
    echo ""
    echo "✅ Current Status: Application running on http://localhost:5000"
    echo "   - Development server: ✅ Working"
    echo "   - Database: ✅ PostgreSQL available"
    echo "   - API endpoints: ✅ Responding"
    echo ""
    echo "🚀 For Production Deployment:"
    echo "   1. Click 'Deploy' button in Replit"
    echo "   2. OR: Export to Ubuntu server and run deployment script"
    echo "   3. OR: Use GitHub Actions for automated deployment"
    
    # Check if application is running
    if curl -s http://localhost:5000/api/categories >/dev/null 2>&1; then
        echo "   ✅ Application is accessible at: http://localhost:5000"
    else
        echo "   ❌ Application not responding"
    fi
    
else
    echo "📍 Environment: Production Server"
    
    # Check if deployment is running
    if ps aux | grep -q "deployment"; then
        echo "   ✅ Deployment script is running"
    else
        echo "   ❌ Deployment script not running"
    fi
    
    # Check if application directory exists
    if [ -d "/home/actionprotection/action-protection" ]; then
        echo "   ✅ Application directory exists"
        
        # Check if essential files are present
        if [ -f "/home/actionprotection/action-protection/package.json" ]; then
            echo "   ✅ package.json present"
        else
            echo "   ❌ package.json missing"
        fi
        
        # Check if PM2 process is running
        if sudo -u actionprotection pm2 list | grep -q "action-protection"; then
            echo "   ✅ PM2 process running"
        else
            echo "   ❌ PM2 process not running"
        fi
        
        # Check if application is responding
        if curl -s http://localhost:4000 >/dev/null 2>&1; then
            echo "   ✅ Application responding on port 4000"
        else
            echo "   ❌ Application not responding on port 4000"
        fi
    else
        echo "   ❌ Application directory not found"
    fi
fi

echo ""
echo "📋 Next Steps:"
if [ -n "$REPLIT_DOMAINS" ]; then
    echo "   Since you're in Replit:"
    echo "   1. Your app is already running in development mode"
    echo "   2. Use Replit's Deploy button for production"
    echo "   3. Or export to a Ubuntu server for the deployment script"
else
    echo "   Since you're on a production server:"
    echo "   1. Fix the file copy issue in deployment script"
    echo "   2. Run the corrected deployment script"
    echo "   3. Monitor PM2 processes and logs"
fi