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

### 11. Build Process
**Problem**: Build failures or incorrect file paths
**Solution**:
- Use relative paths from root directory
- Avoid absolute paths or `/repo/` references
- Test build process before deployment
- Check asset path resolution

### 12. Environment Variables
**Problem**: Missing environment variables in production
**Solution**:
- Document all required environment variables
- Use proper fallbacks where appropriate
- Test with production-like environment
- Implement proper secret management

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

### Common Error Patterns
- **React hydration errors**: Check for client/server mismatch
- **Query errors**: Verify API endpoints and data structure
- **Upload errors**: Check file permissions and upload directory
- **Translation errors**: Verify translation keys exist
- **Layout errors**: Check CSS classes and RTL implementation

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

This guide should be referenced at the start of every new project and consulted when encountering issues. Most problems we've solved can be prevented by following these patterns from the beginning.