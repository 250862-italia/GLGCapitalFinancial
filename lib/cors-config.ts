import { NextRequest } from 'next/server';

// CORS Configuration
// Handles Cross-Origin Resource Sharing for API routes

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://www.glgcapitalgroup.com' 
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export const allowedOrigins = [
  'https://www.glgcapitalgroup.com',
  'https://glgcapitalgroup.com',
  'https://glg-dashboard.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002'
];

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // Allow localhost for development
  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

export function getCorsHeaders(origin: string | null) {
  if (isOriginAllowed(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin || corsHeaders['Access-Control-Allow-Origin']
    };
  }
  
  return corsHeaders;
}

// CORS middleware for API routes
export function withCORS(handler: Function) {
  return async (request: NextRequest) => {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin)
      });
    }
    
    // Add CORS headers to all responses
    const response = await handler(request);
    
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
    
    return response;
  };
} 