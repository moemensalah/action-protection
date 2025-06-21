# LateLounge Cafe - Project Documentation

## Overview
Comprehensive bilingual cafe website featuring Arabic/English support with RTL layout, dark/light themes (dark default), product catalog with modal views, category filtering, animated backgrounds, and comprehensive SEO optimization.

## Project Architecture

### Frontend
- **Framework**: React with Vite
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with custom RTL support
- **UI Components**: Radix UI with shadcn/ui
- **State Management**: TanStack React Query
- **Language Support**: Custom bilingual system with RTL/LTR switching
- **Themes**: Dark/light mode with system preference detection

### Backend
- **Server**: Express.js with TypeScript
- **Storage**: In-memory storage with full CRUD operations
- **API**: RESTful endpoints for categories and products
- **Development**: Vite integration for HMR

### Key Features
- Bilingual interface (Arabic/English) with proper RTL support
- Dark/light theme switching (defaults to dark)
- Product catalog with category filtering and pagination
- Modal product details with click-to-open images
- Animated coffee background with overlay effects
- Comprehensive SEO with structured data
- Mobile-responsive design
- PM2-ready production deployment

## Recent Changes

### 2024-12-21: Production Deployment & PM2 Setup
- ✓ Fixed 404 API route issues in production by ensuring proper route registration order
- ✓ Created PM2 ecosystem configuration for production deployment
- ✓ Added comprehensive deployment scripts and documentation
- ✓ Updated server configuration to handle both development and production modes
- ✓ Fixed RTL layout issues in forms, dropdowns, and modal components
- ✓ Added missing Arabic translations for "Featured", "In Stock", etc.
- ✓ Fixed phone number placeholder positioning in RTL layout
- ✓ Implemented proper X button positioning in modals for RTL

### 2024-12-21: RTL & Translation Improvements
- ✓ Enhanced dropdown RTL support with proper text alignment
- ✓ Fixed footer social media spacing for Arabic layout
- ✓ Added comprehensive CSS rules for RTL select components
- ✓ Implemented clickable product images to open modal
- ✓ Fixed modal title and content alignment for Arabic text
- ✓ Added DialogDescription for accessibility compliance

### 2024-12-21: SEO & Logo Optimization
- ✓ Implemented comprehensive SEO with meta tags, Open Graph, Twitter cards
- ✓ Added JSON-LD structured data for restaurant schema
- ✓ Enhanced HTML head with preconnect links and mobile optimization
- ✓ Updated logo system to use English logos for both languages
- ✓ Fixed hero section coffee image visibility with fade effects

## User Preferences
- Language: English interface for development
- Design: Prefers polished, visually appealing UI
- Code Style: Clean, readable TypeScript with proper type safety
- Communication: Direct, action-oriented updates without excessive explanations

## Technical Decisions

### Storage Strategy
- Using in-memory storage for development and initial deployment
- Can be easily migrated to PostgreSQL with existing schema structure
- Storage interface provides abstraction for future database integration

### Deployment Strategy
- PM2 process manager for production
- Single server handling both API and static file serving
- Environment-based configuration for development/production modes

### RTL Implementation
- CSS-based RTL support with Tailwind utilities
- Proper text direction handling for form inputs and dropdowns
- Arabic font optimization with multiple fallbacks

## API Endpoints
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/products` - List products with pagination and filtering
- `GET /api/products?category=:slug` - Filter products by category

## Deployment Commands
```bash
# Development
npm run dev

# Production build
npm run build

# PM2 deployment
./deploy-pm2.sh

# PM2 management
pm2 status
pm2 logs latelounge-cafe
pm2 restart latelounge-cafe
```

## Current Status
- ✅ Fully functional bilingual cafe website
- ✅ Complete RTL/LTR language support
- ✅ Production-ready with PM2 configuration
- ✅ Comprehensive SEO implementation
- ✅ Mobile-responsive design
- ✅ Dark/light theme support
- ✅ Product modal system with image interaction