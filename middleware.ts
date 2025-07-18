import { NextRequest, NextResponse } from 'next/server';
import { globalPerformanceMonitor } from '@/lib/performance-monitor';

// Configurazione sicurezza
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minuto
    MAX_REQUESTS: 100, // 100 richieste per minuto
    BLOCK_DURATION: 5 * 60 * 1000 // Blocca per 5 minuti
  },
  
  // Headers di sicurezza
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-DNS-Prefetch-Control': 'off'
  },
  
  // CORS
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://glg-capital-financial.vercel.app',
      'https://glgcapitalfinancial.com'
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  }
};

// Cache per rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

// Funzione per pulire la cache del rate limiting
function cleanupRateLimitCache() {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (now > value.resetTime && (!value.blockedUntil || now > value.blockedUntil)) {
      rateLimitCache.delete(key);
    }
  }
}

// Funzione per controllare il rate limiting
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  
  let record = rateLimitCache.get(key);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
    };
  }
  
  // Controlla se l'IP è bloccato
  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil
    };
  }
  
  // Rimuovi il blocco se scaduto
  if (record.blockedUntil && now >= record.blockedUntil) {
    delete record.blockedUntil;
  }
  
  record.count++;
  rateLimitCache.set(key, record);
  
  // Blocca se supera il limite
  if (record.count > SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
    record.blockedUntil = now + SECURITY_CONFIG.RATE_LIMIT.BLOCK_DURATION;
    rateLimitCache.set(key, record);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil
    };
  }
  
  return {
    allowed: true,
    remaining: Math.max(0, SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - record.count),
    resetTime: record.resetTime
  };
}

// Funzione per ottenere l'IP reale
function getRealIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         request.ip ||
         'unknown';
}

// Funzione per controllare CORS
function checkCORS(request: NextRequest): { allowed: boolean; headers: Record<string, string> } {
  const origin = request.headers.get('origin');
  const method = request.method;
  
  // Controlla origine
  const isAllowedOrigin = !origin || SECURITY_CONFIG.CORS.ALLOWED_ORIGINS.includes(origin);
  
  // Controlla metodo
  const isAllowedMethod = SECURITY_CONFIG.CORS.ALLOWED_METHODS.includes(method);
  
  if (!isAllowedOrigin || !isAllowedMethod) {
    return {
      allowed: false,
      headers: {}
    };
  }
  
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': SECURITY_CONFIG.CORS.ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': SECURITY_CONFIG.CORS.ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': '86400' // 24 ore
  };
  
  return {
    allowed: true,
    headers: corsHeaders
  };
}

// Funzione per aggiungere headers di sicurezza
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Aggiungi CSP in produzione
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.vercel.app;"
    );
  }
  
  return response;
}

// Funzione per log delle richieste
function logRequest(request: NextRequest, response: NextResponse, startTime: number) {
  const duration = Date.now() - startTime;
  const ip = getRealIP(request);
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  const status = response.status;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Registra nelle metriche delle performance
  globalPerformanceMonitor.recordAPICall(
    `${method} ${pathname}`,
    duration,
    status < 400
  );
  
  // Log dettagliato per richieste importanti
  if (pathname.startsWith('/api/') || status >= 400) {
    console.log(`[${new Date().toISOString()}] ${method} ${pathname} - ${status} - ${duration}ms - IP: ${ip}`);
  }
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Pulisci cache rate limiting periodicamente
    if (Math.random() < 0.01) { // 1% di probabilità
      cleanupRateLimitCache();
    }
    
    // Ottieni IP reale
    const ip = getRealIP(request);
    
    // Controlla rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
      
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());
      response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      
      logRequest(request, response, startTime);
      return addSecurityHeaders(response);
    }
    
    // Controlla CORS per richieste preflight
    if (request.method === 'OPTIONS') {
      const cors = checkCORS(request);
      if (!cors.allowed) {
        const response = NextResponse.json({ error: 'CORS not allowed' }, { status: 403 });
        logRequest(request, response, startTime);
        return addSecurityHeaders(response);
      }
      
      const response = new NextResponse(null, { status: 200 });
      Object.entries(cors.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      logRequest(request, response, startTime);
      return addSecurityHeaders(response);
    }
    
    // Controlla CORS per richieste normali
    const cors = checkCORS(request);
    if (!cors.allowed) {
      const response = NextResponse.json({ error: 'CORS not allowed' }, { status: 403 });
      logRequest(request, response, startTime);
      return addSecurityHeaders(response);
    }
    
    // Gestisci richieste speciali
    const { pathname } = request.nextUrl;
    
    // Endpoint per metriche delle performance (solo in sviluppo o con autenticazione)
    if (pathname === '/api/performance') {
      if (process.env.NODE_ENV === 'production') {
        // In produzione, richiedi autenticazione per le metriche
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          logRequest(request, response, startTime);
          return addSecurityHeaders(response);
        }
      }
    }
    
    // Endpoint per health check
    if (pathname === '/api/health') {
      const response = NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
      
      logRequest(request, response, startTime);
      return addSecurityHeaders(response);
    }
    
    // Gestisci autenticazione per endpoint protetti
    if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        logRequest(request, response, startTime);
        return addSecurityHeaders(response);
      }
    }
    
    // Continua con la richiesta normale
    const response = NextResponse.next();
    
    // Aggiungi headers CORS
    Object.entries(cors.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Aggiungi headers rate limiting
    response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    
    logRequest(request, response, startTime);
    return addSecurityHeaders(response);
    
  } catch (error) {
    console.error('❌ Errore middleware:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    logRequest(request, response, startTime);
    return addSecurityHeaders(response);
  }
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