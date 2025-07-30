import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotte che richiedono autenticazione
const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/profile',
  '/investments',
  '/settings'
];

// Rotte admin che richiedono permessi speciali
const ADMIN_ROUTES = [
  '/admin',
  '/admin/analytics',
  '/admin/clients',
  '/admin/investments',
  '/admin/users',
  '/admin/kyc',
  '/admin/payments',
  '/admin/notifications',
  '/admin/team',
  '/admin/partnerships',
  '/admin/content',
  '/admin/backup',
  '/admin/audit-trail',
  '/admin/diagnostics',
  '/admin/informational-requests'
];

// Rotte pubbliche che non richiedono autenticazione
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
  '/contact',
  '/landing',
  '/equity-pledge',
  '/informational-request'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔒 Middleware processing: ${pathname}`);
  
  // Gestione CORS
  const response = NextResponse.next();
  
  // Aggiungi headers CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  
  // Gestione preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  // Verifica se è una rotta pubblica
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`✅ Public route: ${pathname}`);
    return response;
  }
  
  // Verifica se è una rotta API
  if (pathname.startsWith('/api/')) {
    console.log(`🔧 API route: ${pathname}`);
    
    // Proteggi le API admin
    if (pathname.startsWith('/api/admin/')) {
      const authHeader = request.headers.get('authorization');
      const csrfToken = request.headers.get('x-csrf-token');
      
      if (!authHeader || !csrfToken) {
        console.log(`❌ Admin API access denied: ${pathname}`);
        return NextResponse.json(
          { error: 'Accesso negato. Autenticazione richiesta.' },
          { status: 401 }
        );
      }
    }
    
    return response;
  }
  
  // Verifica se è una rotta protetta
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`🔒 Protected route: ${pathname}`);
    
    // Verifica autenticazione
    const session = request.cookies.get('session');
    const authToken = request.cookies.get('auth-token');
    
    if (!session && !authToken) {
      console.log(`❌ Unauthenticated access to: ${pathname}`);
      
      // Redirect al login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verifica se è una rotta admin
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`👑 Admin route: ${pathname}`);
      
      // Verifica permessi admin
      const userRole = request.cookies.get('user-role');
      const isAdmin = userRole?.value === 'admin';
      
      if (!isAdmin) {
        console.log(`❌ Non-admin access to admin route: ${pathname}`);
        
        // Redirect alla dashboard utente
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }
  
  // Aggiungi headers di sicurezza
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Aggiungi CSP header
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://vercel.live",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  console.log(`✅ Route processed: ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 