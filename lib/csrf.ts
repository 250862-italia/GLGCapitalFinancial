// CSRF token management - Edge Runtime compatible
// Use a more persistent storage approach for development

import { NextRequest } from 'next/server';

// Global storage for CSRF tokens (persists across requests in development)
declare global {
  var __csrfTokens: Map<string, { createdAt: number; used: boolean; useCount: number }> | undefined;
}

// Initialize global storage if it doesn't exist
if (typeof global !== 'undefined' && !global.__csrfTokens) {
  global.__csrfTokens = new Map();
}

const csrfTokens = global.__csrfTokens!;

// In development, we'll use a more lenient approach
const isDevelopment = process.env.NODE_ENV === 'development';

export function generateCSRFToken(): string {
  // Use crypto.randomUUID() if available, otherwise fallback to Math.random()
  let token: string;
  try {
    token = crypto.randomUUID();
  } catch {
    // Fallback for environments without crypto.randomUUID
    token = Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
  }
  
  csrfTokens.set(token, { createdAt: Date.now(), used: false, useCount: 0 });
  
  // Clean up old tokens (older than 1 hour)
  cleanupExpiredTokens();
  
  console.log(`[CSRF] Generated token: ${token.substring(0, 10)}... (${csrfTokens.size} tokens in storage)`);
  
  return token;
}

// Funzione per estrarre il token CSRF da una richiesta
function extractCSRFToken(request: NextRequest): string | null {
  // Prova prima dall'header
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    console.log('[CSRF] Token found in header');
    return headerToken;
  }
  
  // Prova dal body se è una richiesta POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      // Per richieste JSON, il token dovrebbe essere nel body
      // Questo è gestito nelle route API
      console.log('[CSRF] Token should be in request body for', request.method);
    } catch (error) {
      console.log('[CSRF] Error reading request body:', error);
    }
  }
  
  // Prova dai query parameters
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('csrf');
  if (queryToken) {
    console.log('[CSRF] Token found in query params');
    return queryToken;
  }
  
  console.log('[CSRF] No token found in request');
  return null;
}

// Funzione per validare il token CSRF da una richiesta
export function validateCSRFToken(request: NextRequest): { valid: boolean; token: string | null; error?: string } {
  const token = extractCSRFToken(request);
  
  if (!token) {
    console.log('[CSRF] No token provided');
    // In development, allow some flexibility for missing tokens (but not invalid ones)
    if (isDevelopment) {
      console.log('[CSRF] Development mode: allowing request despite missing token');
      return { valid: true, token: null };
    }
    return { valid: false, token: null, error: 'No CSRF token provided' };
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    console.log('[CSRF] Available tokens:', Array.from(csrfTokens.keys()).map(t => t.substring(0, 10) + '...'));
    
    // Always reject invalid tokens, even in development
    return { valid: false, token, error: 'Invalid CSRF token' };
  }
  
  // Check if token is expired (1 hour)
  const now = Date.now();
  const tokenAge = now - tokenData.createdAt;
  if (tokenAge > 60 * 60 * 1000) { // 1 hour
    console.log('[CSRF] Token expired:', token.substring(0, 10) + '...');
    csrfTokens.delete(token);
    return { valid: false, token, error: 'CSRF token expired' };
  }
  
  // In development, allow multiple uses
  if (isDevelopment) {
    tokenData.useCount++;
    console.log(`[CSRF] Token used ${tokenData.useCount} times:`, token.substring(0, 10) + '...');
    return { valid: true, token };
  }
  
  // In production, one-time use
  if (tokenData.used) {
    console.log('[CSRF] Token already used:', token.substring(0, 10) + '...');
    return { valid: false, token, error: 'CSRF token already used' };
  }
  
  tokenData.used = true;
  tokenData.useCount++;
  console.log(`[CSRF] Token validated successfully:`, token.substring(0, 10) + '...');
  
  return { valid: true, token };
}

// Funzione legacy per compatibilità (accetta stringa)
export function validateCSRFTokenString(token: string): boolean {
  if (!token) {
    console.log('[CSRF] No token provided');
    // In development, allow some flexibility for missing tokens (but not invalid ones)
    if (isDevelopment) {
      console.log('[CSRF] Development mode: allowing request despite missing token');
      return true;
    }
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    
    // Always reject invalid tokens, even in development
    return false;
  }
  
  // Check if token is expired (1 hour)
  const now = Date.now();
  const tokenAge = now - tokenData.createdAt;
  if (tokenAge > 60 * 60 * 1000) { // 1 hour
    console.log('[CSRF] Token expired:', token.substring(0, 10) + '...');
    csrfTokens.delete(token);
    return false;
  }
  
  // In development, allow multiple uses
  if (isDevelopment) {
    tokenData.useCount++;
    console.log(`[CSRF] Token used ${tokenData.useCount} times:`, token.substring(0, 10) + '...');
    return true;
  }
  
  // In production, one-time use
  if (tokenData.used) {
    console.log('[CSRF] Token already used:', token.substring(0, 10) + '...');
    return false;
  }
  
  tokenData.used = true;
  tokenData.useCount++;
  console.log(`[CSRF] Token validated successfully:`, token.substring(0, 10) + '...');
  
  return true;
}

function cleanupExpiredTokens(): void {
  const now = Date.now();
  const expiredTokens: string[] = [];
  
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > 60 * 60 * 1000) { // 1 hour
      expiredTokens.push(token);
    }
  }
  
  expiredTokens.forEach(token => {
    csrfTokens.delete(token);
  });
  
  if (expiredTokens.length > 0) {
    console.log(`[CSRF] Cleaned up ${expiredTokens.length} expired tokens`);
  }
}

// Debug function for development
export function getCSRFTokenCount(): number {
  return csrfTokens.size;
}

export function clearCSRFTokens(): void {
  csrfTokens.clear();
  console.log('[CSRF] All tokens cleared');
} 