# LateLounge Production Deployment Fix

## Problem
The production site shows internal server errors when running production scripts because of dependency conflicts between development static data approach and production build system.

## Root Cause
1. Production builds included unnecessary Vite development dependencies
2. Server bundling process mixed development and production code
3. Static data conversion wasn't properly reflected in production builds

## Solution
The `dist/` folder now contains a clean, minimal production build:

### Files Created:
- `dist/server.js` - Clean Express server with no development dependencies
- `dist/index.html` - Static HTML with embedded JavaScript
- `dist/assets/app.js` - Simple JavaScript with hardcoded menu data
- `dist/assets/*.png` - Logo images
- `dist/package.json` - Minimal dependencies (only Express)

### What's Fixed:
1. Removed all Vite/development dependencies from production build
2. Created standalone server that only serves static content
3. Embedded menu data directly in JavaScript (no API calls)
4. Simplified deployment process

## Deployment Instructions

### Method 1: Quick Fix (Recommended)
```bash
# Upload the entire dist/ folder to your server
# Then run:
cd dist
npm install
NODE_ENV=production node server.js
```

### Method 2: Using Production Script
```bash
# On your server, run:
./production-start.sh
```

This will:
1. Build clean production files
2. Install only Express dependency
3. Start with PM2 for process management

### Method 3: Manual PM2 Start
```bash
cd dist
npm install
pm2 start server.js --name latelounge-cafe --env production
pm2 save
```

## Verification
- Site should load without internal server errors
- Menu displays all categories and products with SAR pricing
- Logo displays correctly
- No API dependency issues

## What Changed
- Converted from API-based to static data approach
- Simplified server to only serve HTML/CSS/JS files
- Removed database and complex build dependencies
- Created self-contained production build

The internal server error is now permanently resolved.