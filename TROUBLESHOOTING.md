# Troubleshooting Guide

## Common Issues and Solutions

### 404 Errors for Pages

If you encounter 404 errors for pages that should exist (like `/register`, `/login`, etc.):

#### Solution 1: Clear Next.js Cache
```bash
# Stop the development server
pkill -f "next dev"

# Clear the Next.js build cache
rm -rf .next

# Restart the development server
npm run dev
```

#### Solution 2: Check File Structure
Ensure the page files exist in the correct locations:
- `/app/register/page.tsx` for `/register`
- `/app/login/page.tsx` for `/login`
- etc.

#### Solution 3: Verify Page Exports
Make sure each page file has a proper default export:
```typescript
export default function PageName() {
  // Component content
}
```

### Admin Authentication Issues

If admin pages return 401 (Unauthorized):

#### Solution 1: Check Admin Token
Ensure the admin token is being sent in headers:
```typescript
const adminToken = localStorage.getItem('admin_token');
const response = await fetch('/api/admin/endpoint', {
  headers: {
    'x-admin-token': adminToken || '',
    'Content-Type': 'application/json'
  }
});
```

#### Solution 2: Verify Admin Login
Make sure you're logged in as admin:
1. Go to `/admin/login`
2. Use valid admin credentials
3. Check localStorage for `admin_token`

### CSRF Token Issues

If you get CSRF validation errors:

#### Solution 1: Use CSRF-Enabled Fetch
```typescript
import { fetchJSONWithCSRF } from '@/lib/csrf-client';

const response = await fetchJSONWithCSRF('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### Solution 2: Check Token Generation
Ensure CSRF tokens are being generated:
```bash
curl http://localhost:3001/api/csrf
```

### Development Server Issues

#### Port Conflicts
If port 3000 is in use, Next.js will automatically try 3001, 3002, etc.

#### Memory Issues
If the server becomes unresponsive:
```bash
# Kill all Node.js processes
pkill -f node

# Clear cache and restart
rm -rf .next
npm run dev
```

### Database Connection Issues

#### Supabase Connection
Check environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Connection Health
Test database connection:
```bash
curl http://localhost:3001/api/health
```

### Performance Issues

#### Build Optimization
```bash
# Clean build
npm run clean
npm run build

# Check bundle size
npm run lighthouse
```

#### Memory Leaks
Monitor memory usage and restart server if needed.

## Quick Fixes

### Reset Everything
```bash
# Stop all processes
pkill -f node
pkill -f "next dev"

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Restart development server
npm run dev
```

### Check Logs
Monitor the development server logs for specific error messages and stack traces.

### Environment Variables
Ensure all required environment variables are set in `.env.local`:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## Getting Help

If issues persist:
1. Check the browser console for JavaScript errors
2. Check the server logs for backend errors
3. Verify all dependencies are installed correctly
4. Ensure you're using the correct Node.js version (>=18.0.0) 