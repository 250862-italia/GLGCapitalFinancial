import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route pubbliche (sempre accessibili)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/landing',
  '/forgot-password',
  '/api/health',
  '/api/notes',
  '/api/test-supabase'
];

// Route che richiedono autenticazione
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/admin',
  '/investments',
  '/settings'
];

// Route che richiedono ruolo admin
const ADMIN_ROUTES = [
  '/admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. APPLICA HEADERS DI SICUREZZA BASE
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. FORZA HTTPS SOLO IN PRODUZIONE
  if (process.env.NODE_ENV === 'production' && 
      !request.headers.get('x-forwarded-proto')?.includes('https') &&
      !request.url.includes('localhost')) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 3. PERMETTI ACCESSO PUBBLICO A ROUTE SPECIFICHE
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response;
  }

  // 4. PROTEZIONE ROUTE CON AUTENTICAZIONE SEMPLIFICATA
  if (isProtectedRoute(pathname)) {
    // Per ora, reindirizza al login per le route protette
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route)) ||
         ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 