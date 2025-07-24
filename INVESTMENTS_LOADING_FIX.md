# Investments Page Loading Fix

## Problem
The investments page (`/dashboard/investments`) was stuck in a loading state showing "Loading investments..." indefinitely. The page was not progressing past the loading screen.

## Root Cause
The issue was in the `useAuth` hook (`hooks/use-auth.ts`). The hook was not properly checking authentication on mount, instead immediately setting `loading: false` without verifying if the user was authenticated.

### Original Problematic Code:
```typescript
useEffect(() => {
  if (!hasCheckedAuth.current) {
    // Per ora, non facciamo controlli automatici
    // L'utente dovrà fare login manualmente
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
    hasCheckedAuth.current = true;
  }
}, []);
```

This meant that:
1. The `useAuth` hook would immediately set `user: null` and `loading: false`
2. The investments page would see `user: null` and try to fetch investments
3. Since there was no user, the `fetchInvestments()` function would return early
4. The page would remain in the loading state forever

## Solution
Modified the `useAuth` hook to properly check authentication on mount:

### Fixed Code:
```typescript
useEffect(() => {
  if (!hasCheckedAuth.current) {
    checkAuth();
    hasCheckedAuth.current = true;
  }
}, []);

const checkAuth = useCallback(async () => {
  try {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    // Get CSRF token first
    const csrfResponse = await fetch('/api/csrf', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!csrfResponse.ok) {
      throw new Error('Failed to get CSRF token');
    }

    const csrfData = await csrfResponse.json();

    // Check auth with CSRF token
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } else {
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    setAuthState({
      user: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Authentication error'
    });
  }
}, []);
```

## Changes Made
1. **Fixed `useAuth` hook**: Now properly checks authentication on mount instead of immediately setting `user: null`
2. **Added proper error handling**: Added console.error for debugging auth check issues
3. **Maintained CSRF protection**: All authentication checks still use proper CSRF tokens

## Testing Results
✅ Server is running on port 3000  
✅ Authentication is working  
✅ CSRF protection is active  
✅ Investments page is accessible  
✅ Static assets are loading  
✅ React components are hydrating  

## Impact
- **Before**: Investments page stuck in loading state
- **After**: Investments page loads correctly and shows user's investment data or empty state
- **Authentication**: Users are now properly authenticated on page load
- **User Experience**: Smooth navigation and proper loading states

## Files Modified
- `hooks/use-auth.ts` - Fixed authentication check on mount

## Related Issues Resolved
- Fixed the "ancora non è accessibile" (still not accessible) issue
- Resolved webpack module errors by reinstalling dependencies
- Fixed port conflicts by clearing all conflicting processes
- Ensured static assets are loading correctly 