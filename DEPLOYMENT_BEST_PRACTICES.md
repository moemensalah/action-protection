# Deployment Best Practices - Action Protection Platform

## Overview
This document captures all deployment challenges encountered and their proven solutions for the Action Protection automotive platform. Use this as a reference for future deployments and troubleshooting.

## Common Deployment Errors and Solutions

### 1. React Application Loading Issues

**Error:** Blank page loading, "loading your page" persistent message
**Symptoms:**
- Browser shows loading spinner indefinitely
- React app fails to initialize
- Console shows component errors

**Root Cause:** TanStack Query v5 compatibility issues with deprecated configuration
**Solution:**
```javascript
// ❌ Wrong - causes app crashes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // Deprecated in v5
    },
  },
});

// ✅ Correct - v5 compatible
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // Use gcTime instead of cacheTime
    },
  },
});
```

### 1.1. HMR (Hot Module Reload) Failures

**Error:** "[hmr] Failed to reload /src/components/admin/AiSettings.tsx"
**Symptoms:**
- Hot reload fails during development
- Browser shows "server connection lost" messages
- Component changes don't reflect in browser

**Root Cause:** Syntax errors, missing imports, or circular dependencies
**Solution:**
```javascript
// ❌ Common issues
import { AiSettings } from './AiSettings'; // Missing component
const TestComponent = () => <div>Test</div>; // Undefined component

// ✅ Proper imports and exports
import { AiSettings } from '@/components/admin/AiSettings';
export const TestComponent = () => <div>Test</div>;
```

### 1.2. Component Definition Errors

**Error:** "Uncaught ReferenceError: Component is not defined"
**Symptoms:**
- React components fail to render
- "Component is not defined" in console
- Application crashes on specific routes

**Root Cause:** Missing component exports or incorrect import paths
**Solution:**
```javascript
// ❌ Missing export
function MyComponent() { return <div>Hello</div>; }

// ✅ Proper export
export function MyComponent() { return <div>Hello</div>; }
// or
export default MyComponent;
```

### 2. Component Import/Export Errors

**Error:** "Component is not defined" or "useLocation is not defined"
**Symptoms:**
- HMR (Hot Module Reload) failures
- Component rendering errors
- Missing import statements

**Root Cause:** Missing imports or incorrect component references
**Solution:**
```javascript
// ❌ Missing imports
function App() {
  const [location] = useLocation(); // Error: useLocation not defined
}

// ✅ Correct imports
import { useLocation } from "wouter";
function App() {
  const [location] = useLocation();
}
```

### 3. Database Connection Issues

**Error:** Connection timeout, SSL/TLS errors
**Symptoms:**
- Server fails to start
- Database queries timeout
- Connection pool exhaustion

**Root Cause:** Incompatible database drivers or connection configuration
**Solution:**
```javascript
// ❌ Standard pg driver causing timeouts
import { Pool } from 'pg';

// ✅ Use Neon serverless driver for better compatibility
import { Pool } from '@neondatabase/serverless';
```

### 4. Email Service Configuration Errors

**Error:** "require is not defined" in email service
**Symptoms:**
- Email sending failures
- Module import errors
- SMTP connection issues

**Root Cause:** Mixed CommonJS/ES Module syntax
**Solution:**
```javascript
// ❌ CommonJS syntax in ES modules
const nodemailer = require('nodemailer');

// ✅ ES Module syntax
import nodemailer from 'nodemailer';
```

**Additional Email Configuration:**
```javascript
// SMTP Settings for Postmark
const smtpConfig = {
  host: 'smtp.postmarkapp.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: 'your-server-token',
    pass: 'your-server-token'
  }
};
```

### 5. Authentication Session Issues

**Error:** Session not persisting, immediate logout after login
**Symptoms:**
- Users logged out on page refresh
- Session cookies not set
- Authentication state lost

**Root Cause:** Session variable mismatch between login and authentication check
**Solution:**
```javascript
// ❌ Inconsistent session variables
// Login sets: req.session.userId = user.id
// Auth check uses: req.session.localUser

// ✅ Consistent session variables
// Login sets: req.session.userId = user.id
// Auth check uses: req.session.userId
```

### 6. Admin Panel Loading State Issues

**Error:** Inconsistent loading animations across admin sections
**Symptoms:**
- Mixed loading patterns (shimmer, spinners, text)
- Unprofessional user experience
- Different loading states in different components

**Root Cause:** Multiple loading components without standardization
**Solution:**
```jsx
// ✅ Standardized loading component
const AdminLoading = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
);

// Use consistently across all admin components
{isLoading && <AdminLoading />}
```

### 7. RTL Layout Issues

**Error:** Inconsistent right-to-left layout in Arabic mode
**Symptoms:**
- Text alignment issues
- Icon positioning problems
- Form layout inconsistencies

**Root Cause:** Missing RTL-specific CSS classes
**Solution:**
```jsx
// ✅ Proper RTL support
<div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center`}>
  <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>Icon</span>
  <span>Text</span>
</div>
```

### 8. File Upload Translation Issues

**Error:** File input buttons showing English in Arabic mode
**Symptoms:**
- Hardcoded English text in file inputs
- Inconsistent language switching

**Root Cause:** Browser default file input styling
**Solution:**
```jsx
// ✅ Custom file input with proper translation
<div className="file-input-wrapper">
  <input type="file" className="hidden" id="fileInput" />
  <label htmlFor="fileInput" className="cursor-pointer">
    {t('chooseFiles')} {/* Translates to "اختر الملفات" in Arabic */}
  </label>
</div>
```

### 9. Recent Development Errors (January 2025)

**Error:** "useLocation is not defined" in App.tsx
**Symptoms:**
- React router errors during development
- App crashes on route changes
- Console shows undefined function errors

**Root Cause:** Missing wouter import
**Solution:**
```javascript
// ❌ Missing import
function App() {
  const [location] = useLocation(); // Error: useLocation not defined
}

// ✅ Correct import
import { useLocation } from "wouter";
function App() {
  const [location] = useLocation();
}
```

**Error:** "mutation is not defined" in admin components
**Symptoms:**
- Admin panel operations fail
- Form submissions don't work
- Error in components using mutations

**Root Cause:** Incorrect mutation references in components
**Solution:**
```javascript
// ❌ Wrong mutation reference
const handleSubmit = async () => {
  await mutation.mutateAsync(data); // mutation not defined
};

// ✅ Correct mutation usage
const mutation = useMutation({
  mutationFn: apiRequest,
  onSuccess: () => {
    // Handle success
  }
});

const handleSubmit = async () => {
  await mutation.mutateAsync(data);
};
```

### 10. Database Connection Pool Issues

**Error:** Connection timeout, pool exhaustion
**Symptoms:**
- Server fails to start with database errors
- Long response times for database queries
- "Client has encountered a connection error" messages

**Root Cause:** Database driver compatibility issues
**Solution:**
```javascript
// ❌ Standard pg driver causing issues
import { Pool } from 'pg';

// ✅ Use Neon serverless driver
import { Pool } from '@neondatabase/serverless';

// Proper connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
});
```

## Production Deployment Checklist

### Pre-Deployment
- [ ] Update all dependencies to latest stable versions
- [ ] Fix all TypeScript compilation errors
- [ ] Test all authentication flows
- [ ] Verify database migrations are up to date
- [ ] Check all environment variables are set

### Build Process
- [ ] Clean build directory: `rm -rf dist`
- [ ] Install dependencies: `npm ci`
- [ ] Run build: `npm run build`
- [ ] Verify build artifacts exist in `dist/` directory

### Database Setup
- [ ] Create database user with proper permissions
- [ ] Run database migrations: `npm run db:push`
- [ ] Seed production data: `npm run seed`
- [ ] Test database connectivity

### Server Configuration
- [ ] Configure PM2 ecosystem file
- [ ] Set up proper logging directories
- [ ] Configure environment variables
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure SSL certificates

### Post-Deployment Testing
- [ ] Verify main website loads correctly
- [ ] Test user registration and login
- [ ] Verify admin panel accessibility
- [ ] Test order creation workflow
- [ ] Verify email notifications work
- [ ] Test all API endpoints

## Environment Variables Template

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
PGHOST=localhost
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name

# Authentication
SESSION_SECRET=your-secure-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.com

# Email (Optional)
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your-server-token
SMTP_PASS=your-server-token
ADMIN_EMAIL=admin@yourdomain.com
```

## PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'action-protection',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

## Troubleshooting Quick Commands

### Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs action-protection

# Check specific log files
tail -f logs/err.log
tail -f logs/out.log
```

### Development Debugging (January 2025)
```bash
# Check for HMR issues
npm run dev
# Look for "[hmr] Failed to reload" messages

# Check component imports
grep -r "import.*from" client/src/components/
grep -r "export" client/src/components/

# Verify database connection
psql $DATABASE_URL -c "SELECT current_user;"

# Check server logs for API errors
tail -f logs/combined.log | grep -E "(401|403|404|500)"
```

### Common Fix Commands
```bash
# Fix React app loading issues
rm -rf node_modules/.vite
npm run dev

# Fix component import issues
# Check and fix missing imports in problematic files

# Fix database connection issues
npm run db:push
npm run seed

# Restart development server
# Stop current process (Ctrl+C)
npm run dev
```

### Database Diagnostics
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT current_user;"

# Check database tables
psql $DATABASE_URL -c "\dt"

# Check running processes
ps aux | grep node
```

### Application Debugging
```bash
# Test API endpoints
curl -I http://localhost:3000/api/categories
curl -I http://localhost:3000/api/products

# Check port usage
netstat -tlnp | grep :3000
lsof -i :3000
```

## Recovery Procedures

### Complete Application Reset
1. Stop all processes: `pm2 stop all && pm2 delete all`
2. Clean build: `rm -rf dist node_modules`
3. Reinstall dependencies: `npm ci`
4. Rebuild application: `npm run build`
5. Restart with PM2: `pm2 start ecosystem.config.js --env production`

### Database Recovery
1. Drop and recreate database (if data loss acceptable)
2. Run migrations: `npm run db:push`
3. Reseed data: `npm run seed`
4. Restart application

### Cache Issues
1. Clear browser cache
2. Delete `node_modules/.vite` directory
3. Rebuild application
4. Clear PM2 cache: `pm2 flush`

## Performance Optimization

### Database Optimization
- Use connection pooling
- Implement proper indexing
- Use read replicas for heavy read operations
- Monitor slow queries

### Application Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement proper caching headers
- Monitor memory usage

### Frontend Optimization
- Optimize images (WebP format)
- Use lazy loading for components
- Implement code splitting
- Minify CSS and JavaScript

## Security Best Practices

### Authentication
- Use secure session secrets
- Implement rate limiting
- Use HTTPS in production
- Validate all user inputs

### Database Security
- Use parameterized queries
- Implement proper access controls
- Regular security updates
- Monitor for unusual activity

### Application Security
- Keep dependencies updated
- Implement CORS properly
- Use environment variables for secrets
- Regular security audits

## Monitoring and Alerting

### Key Metrics to Monitor
- Application uptime
- Response times
- Error rates
- Memory usage
- Database performance

### Log Analysis
- Monitor error patterns
- Track user behavior
- Analyze performance bottlenecks
- Set up automated alerts

## Backup and Recovery

### Database Backups
- Daily automated backups
- Test restore procedures
- Store backups securely
- Document recovery procedures

### Application Backups
- Version control for code
- Configuration backups
- Asset backups
- Environment documentation

---

## Summary

This document provides a comprehensive reference for deploying the Action Protection platform successfully. All solutions have been tested and verified to work in production environments. Keep this document updated as new issues are discovered and resolved.

For urgent issues, refer to the troubleshooting section first, then follow the recovery procedures if needed. Always test changes in a staging environment before applying to production.