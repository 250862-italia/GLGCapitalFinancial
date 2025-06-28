import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or headers
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Protected routes that require authentication
  const protectedRoutes = ['/reserved', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/iscriviti', '/', '/about', '/contact', '/admin/login'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // If accessing protected route without token, redirect to appropriate login
  if (isProtectedRoute && !token) {
    // If trying to access admin routes, redirect to admin login
    if (pathname.startsWith('/admin')) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    } else {
      // For other protected routes, redirect to regular login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If accessing login page with valid token, redirect to reserved area
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/reserved', request.url));
  }
  
  // If accessing admin login page with valid admin token, redirect to admin dashboard
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 