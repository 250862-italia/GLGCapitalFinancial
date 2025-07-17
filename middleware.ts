import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configurazione sicurezza
const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100 // max 100 richieste per finestra
  },
  
  // Headers di sicurezza
  securityHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://dobjulfwktzltpvqtxbql.supabase.co;"
  }
};

// Route che richiedono autenticazione
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/admin'
];

// Route che richiedono ruolo admin
const ADMIN_ROUTES = [
  '/admin'
];

// Route pubbliche (sempre accessibili)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact'
];

// Rate limiting store (in produzione usare Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. APPLICA HEADERS DI SICUREZZA
  Object.entries(SECURITY_CONFIG.securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 2. FORZA HTTPS IN PRODUZIONE
  if (process.env.NODE_ENV === 'production' && !request.headers.get('x-forwarded-proto')?.includes('https')) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 3. RATE LIMITING
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = SECURITY_CONFIG.rateLimit.windowMs;
  
  const clientData = rateLimitStore.get(clientIP);
  
  if (clientData && now < clientData.resetTime) {
    if (clientData.count >= SECURITY_CONFIG.rateLimit.max) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    clientData.count++;
  } else {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + windowMs
    });
  }

  // 4. PROTEZIONE ROUTE
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect a login se non autenticato
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verifica ruolo per route admin
    if (isAdminRoute(pathname)) {
      const userRole = getUserRoleFromToken(token);
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  // 5. VALIDAZIONE INPUT
  if (request.method === 'POST' || request.method === 'PUT') {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Validazione JSON payload
      const clonedRequest = request.clone();
      clonedRequest.json().catch(() => {
        return new NextResponse('Invalid JSON', { status: 400 });
      });
    }
  }

  // 6. SANITIZZAZIONE URL
  const sanitizedUrl = sanitizeUrl(request.url);
  if (sanitizedUrl !== request.url) {
    return NextResponse.redirect(sanitizedUrl);
  }

  // 7. LOGGING (solo per route importanti)
  if (isProtectedRoute(pathname) || pathname.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${clientIP}`);
  }

  return response;
}

// Funzioni helper
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

function getUserRoleFromToken(token: string): string | null {
  try {
    // In produzione, verifica il token con Supabase o JWT
    // Per ora, simuliamo la verifica
    if (token.includes('admin')) return 'admin';
    if (token.includes('superadmin')) return 'superadmin';
    return 'user';
  } catch {
    return null;
  }
}

function sanitizeUrl(url: string): string {
  // Rimuovi caratteri pericolosi dall'URL
  const dangerousChars = /[<>\"'%]/g;
  return url.replace(dangerousChars, '');
}

// Configurazione middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 