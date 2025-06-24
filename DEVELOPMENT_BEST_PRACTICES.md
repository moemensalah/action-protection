# Development Best Practices & Common Issues Guide

## Overview
This document captures all the common issues encountered during full-stack development and their proven solutions. Use this as a reference for new projects to avoid repeated problems.

## Frontend Issues & Solutions

### 1. File Upload Systems
**Problem**: File uploads fail or don't sync properly with UI state
**Solution**: 
- Always sync preview state with value prop using `useEffect`
- Implement proper drag-and-drop with validation
- Use utility functions like `getImageUrl()` for consistent image handling
- Never require removal of previous images before uploading new ones

```typescript
// Correct file upload component pattern
useEffect(() => {
  if (value && value !== preview) {
    setPreview(value);
  }
}, [value]);
```

### 2. RTL/LTR Layout Issues
**Problem**: Components don't adapt properly to Arabic RTL layouts
**Solution**: Apply systematic RTL fixes using this pattern:

```typescript
// Universal RTL pattern
const { isRTL } = useLanguage();

// Conditional classes
className={`${isRTL ? 'rtl-classes' : 'ltr-classes'}`}

// Direction attribute
dir={isRTL ? 'rtl' : 'ltr'}

// Icon switching
{isRTL ? <RightIcon /> : <LeftIcon />}

// Layout reversal
className={`${isRTL ? 'flex-row-reverse' : ''}`}
```

**RTL Checklist**:
- Navigation elements (search bars, dropdowns)
- Forms and input fields
- Tables and data displays
- Pagination controls
- Icon directions (arrows, chevrons)
- Text alignment
- Padding and margins

### 3. Pagination Issues
**Problem**: Pagination doesn't update content or has incorrect translations
**Solution**:
- Use proper query key structure: `["/api/endpoint", param1, param2, currentPage]`
- Implement custom pagination buttons for translation support
- Fix hardcoded text in shadcn components
- Add proper RTL arrow directions

```typescript
// Correct query structure
const { data } = useQuery({
  queryKey: ["/api/products", categorySlug, searchQuery, currentPage],
  queryFn: async () => {
    const params = new URLSearchParams();
    // Build query parameters properly
  }
});
```

### 4. Translation System
**Problem**: Hardcoded text not translating or missing translations
**Solution**:
- Always use `t("key")` function for all user-facing text
- Add both English and Arabic translations to `translations.ts`
- Replace hardcoded text in UI components
- Use proper fallback patterns

```typescript
// Add to translations.ts
en: {
  noProductsSearch: "No products found matching your search",
},
ar: {
  noProductsSearch: "لا توجد منتجات تطابق بحثك",
}
```

### 5. Form Validation Issues
**Problem**: Forms fail silently or show incorrect validation errors
**Solution**:
- Always log `form.formState.errors` for debugging
- Use proper Zod schema validation
- Implement proper error handling with toast notifications
- Check for field name mismatches

### 6. Query State Management
**Problem**: Data doesn't refresh or cache invalidation fails
**Solution**:
- Use hierarchical query keys: `['/api/items', id]` not `['/api/items/${id}']`
- Always invalidate cache after mutations
- Import `queryClient` for cache operations
- Use proper dependency arrays

## Backend Issues & Solutions

### 7. Database Connection Issues
**Problem**: Database queries fail or connection errors
**Solution**:
- Always check DATABASE_URL environment variable
- Use proper error handling in database operations
- Implement connection pooling correctly
- Test database connectivity before deploying

### 8. File Serving Issues
**Problem**: Uploaded files not accessible or CORS errors
**Solution**:
- Set up proper static file serving for `/uploads` route
- Add CORS headers for file access
- Use absolute URLs for file references
- Implement proper file validation

```typescript
// Correct file serving setup
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(uploadsDir));
```

### 9. API Route Organization
**Problem**: Routes become unorganized or have inconsistent patterns
**Solution**:
- Group related routes together
- Use consistent naming conventions
- Implement proper middleware (authentication, validation)
- Add comprehensive error handling

### 10. Session Management
**Problem**: Session storage issues or authentication failures
**Solution**:
- Use DatabaseStorage for session persistence
- Implement proper session configuration
- Handle token refresh correctly
- Add proper logout functionality

## Production Deployment Issues

### 11. Static File Structure & Asset Serving
**Problem**: Production blank page, assets not loading, incorrect file paths
**Root Cause**: Mismatch between Vite build output structure and server expectations
**Solution**:
- Server expects files in `dist/public/` but Vite outputs to `dist/`
- Move `index.html`, `manifest.json`, and `assets/` to `dist/public/` structure
- Copy all attached assets (logos, hero images) to both `client/public/assets/` and `dist/public/assets/`
- Use correct Nginx configuration pointing to `dist/public/` not just `dist/`

```bash
# Fix production static file structure
sudo -u ${APP_USER} mkdir -p dist/public
sudo -u ${APP_USER} mv "dist/index.html" "dist/public/" 2>/dev/null || true
sudo -u ${APP_USER} mv "dist/assets" "dist/public/" 2>/dev/null || true
```

### 12. Node.js Environment & Process Management
**Problem**: Server runs in development mode causing blank pages and performance issues
**Root Cause**: NODE_ENV not properly set to 'production' in deployment
**Solution**:
- Force NODE_ENV=production in ecosystem.config.cjs
- Use production server entry point (server/production.ts)
- Configure PM2 properly with production environment variables
- Ensure server runs on correct port (3000 vs 5000 conflict)

```javascript
// Correct PM2 configuration
env_production: {
  NODE_ENV: 'production',
  PORT: 3000
}
```

### 13. PostgreSQL Database Flexibility Issues
**Problem**: Database connection failures, permission issues, existing data conflicts
**Root Cause**: Inflexible database setup not handling existing installations
**Solution**:
- Add DROP_EXISTING_DATABASE variable for controlled database recreation
- Implement proper database user permissions and role management
- Handle both fresh installs and updates gracefully
- Add database connectivity testing before proceeding

```bash
# Flexible database setup
if [ "$DROP_EXISTING_DATABASE" = "true" ]; then
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" || true
fi
```

### 14. Asset Path Resolution in Production
**Problem**: Custom images (hero backgrounds, logos) not displaying in production
**Root Cause**: Assets not copied to final production location
**Solution**:
- Copy assets during build phase to `client/public/assets/`
- Copy again to final production location `dist/public/assets/`
- Ensure deployment script handles all custom attached assets
- Verify asset paths match frontend references (`/assets/filename.jpg`)

### 15. Port Conflicts & Service Management
**Problem**: Port conflicts, services not starting, PM2 not binding to correct port
**Root Cause**: Multiple services competing for same port, improper PM2 configuration
**Solution**:
- Kill conflicting processes before starting new ones
- Use consistent port configuration (3000) across all components
- Implement proper service health checks
- Add connectivity testing after deployment

### 16. Build Process & Dependencies
**Problem**: Build failures, missing dependencies, Rollup issues
**Root Cause**: Linux-specific build dependencies not installed
**Solution**:
- Install @rollup/rollup-linux-x64-gnu for Ubuntu deployment
- Clean node_modules and package-lock.json before fresh install
- Retry build process multiple times with different strategies
- Handle npm permission issues properly

### 17. Environment Variables & Configuration
**Problem**: Missing environment variables, incorrect configuration values
**Root Cause**: Environment variables not properly set or accessed
**Solution**:
- Create comprehensive .env file with all required variables
- Document all environment variables in deployment script
- Use proper fallbacks where appropriate
- Test environment variable access before proceeding

## Development Workflow Best Practices

### 13. Error Handling Patterns
**Always implement**:
- Comprehensive try-catch blocks
- User-friendly error messages
- Proper logging for debugging
- Fallback UI states

### 14. Performance Optimization
**Key practices**:
- Implement proper loading states
- Use skeleton components during data fetching
- Optimize query patterns
- Minimize unnecessary re-renders

### 15. Code Organization
**Structure guidelines**:
- Keep components focused and single-purpose
- Use proper TypeScript interfaces
- Implement consistent naming conventions
- Document complex logic

## Testing Checklist

### Before Deployment
- [ ] Test all CRUD operations
- [ ] Verify file upload functionality
- [ ] Test both LTR and RTL layouts
- [ ] Check all translations
- [ ] Test pagination on all list views
- [ ] Verify authentication flows
- [ ] Test responsive design
- [ ] Check database operations
- [ ] Verify API endpoints
- [ ] Test error handling

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers
- [ ] Different screen sizes

## Emergency Debugging Steps

### When Things Break
1. Check browser console for errors
2. Verify network requests in developer tools
3. Check server logs for backend errors
4. Validate environment variables
5. Test database connectivity
6. Clear browser cache and storage
7. Restart development server
8. Check file permissions

### Production-Specific Debugging
1. **Blank Page Issues**:
   - Check if NODE_ENV=production is set
   - Verify `dist/public/index.html` exists
   - Test static file serving path
   - Check PM2 logs: `pm2 logs appname`

2. **Asset Loading Failures**:
   - Verify assets exist in `dist/public/assets/`
   - Check Nginx configuration for correct asset paths
   - Test direct asset URL access
   - Verify file permissions (644 for files, 755 for directories)

3. **Database Connection Issues**:
   - Test database connectivity: `psql -U username -d database -c "SELECT 1;"`
   - Check database user permissions
   - Verify DATABASE_URL format and credentials
   - Ensure PostgreSQL service is running

4. **Service Management Issues**:
   - Check PM2 status: `pm2 status`
   - Verify port availability: `netstat -tlnp | grep :3000`
   - Test service binding: `curl localhost:3000`
   - Check system resources: `free -h`, `df -h`

### Common Error Patterns
- **React hydration errors**: Check for client/server mismatch
- **Query errors**: Verify API endpoints and data structure
- **Upload errors**: Check file permissions and upload directory
- **Translation errors**: Verify translation keys exist
- **Layout errors**: Check CSS classes and RTL implementation
- **Production blank page**: Always check NODE_ENV and static file structure
- **Asset 404 errors**: Verify deployment script copied all attached assets
- **Database errors**: Check user permissions and connection string format
- **Port binding errors**: Kill conflicting processes before starting services

## Project Setup Automation

### Initial Setup Checklist
- [ ] Set up proper environment variables
- [ ] Configure database connection
- [ ] Implement authentication system
- [ ] Set up file upload handling
- [ ] Configure translation system
- [ ] Implement theme switching
- [ ] Set up RTL/LTR support
- [ ] Configure build process
- [ ] Set up error handling
- [ ] Implement logging system

### Production Deployment Checklist
- [ ] Verify NODE_ENV=production in all configurations
- [ ] Set up proper static file structure (dist/public/)
- [ ] Copy all attached assets to production locations
- [ ] Configure database with flexible setup options
- [ ] Implement proper port management (avoid conflicts)
- [ ] Set up PM2 with production environment
- [ ] Configure Nginx with correct asset paths
- [ ] Test database connectivity before proceeding
- [ ] Implement health checks for all services
- [ ] Add comprehensive error logging

### Critical Production Issues Reference

**Issue**: Blank page in production
**Quick Fix**: Check NODE_ENV=production and verify dist/public/index.html exists

**Issue**: Assets not loading (404 errors)
**Quick Fix**: Ensure deployment script copies attached_assets to dist/public/assets/

**Issue**: Database connection failures
**Quick Fix**: Verify user permissions and DATABASE_URL format

**Issue**: Port conflicts
**Quick Fix**: Kill conflicting processes: `sudo fuser -k 3000/tcp`

**Issue**: PM2 not starting correctly
**Quick Fix**: Check ecosystem.config.cjs has correct NODE_ENV and paths

### Update Script Usage
For existing deployments, use the quick update script:
```bash
./update-production.sh
```

This handles:
- Git updates
- Asset copying
- Dependency installation
- Application rebuild
- Service restart

This comprehensive guide covers all major issues encountered in full-stack development and production deployment. Reference this document at project start and when troubleshooting to avoid repeated problems and ensure consistent solutions.