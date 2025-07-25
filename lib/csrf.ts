// CSRF token management - Edge Runtime compatible
// Use in-memory storage with better error handling and memory optimization protection

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for CSRF tokens
declare global {
  var __csrfTokens: Map<string, { createdAt: number; used: boolean; useCount: number; protected: boolean }> | undefined;
  var __csrfTokenCount: number | undefined;
}

// Initialize global storage if it doesn't exist
if (typeof global !== 'undefined' && !global.__csrfTokens) {
  global.__csrfTokens = new Map();
  global.__csrfTokenCount = 0;
}

const csrfTokens = global.__csrfTokens!;
const tokenCount = global.__csrfTokenCount!;

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
  
  const now = Date.now();
  csrfTokens.set(token, { 
    createdAt: now, 
    used: false, 
    useCount: 0,
    protected: true // Mark as protected during generation
  });
  global.__csrfTokenCount = (global.__csrfTokenCount || 0) + 1;
  
  // Clean up old tokens (older than 1 hour) but preserve protected ones
  cleanupExpiredTokens();
  
  console.log(`[CSRF] Generated token: ${token.substring(0, 10)}... (${csrfTokens.size} tokens in storage, total generated: ${global.__csrfTokenCount})`);
  
  return token;
}

// Funzione per estrarre il token CSRF da una richiesta
function extractCSRFToken(request: NextRequest): string | null {
  // Prova prima dall'header
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    console.log('[CSRF] Token found in header:', headerToken.substring(0, 10) + '...');
    return headerToken;
  }
  
  // Prova dai cookie
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (cookieToken) {
    console.log('[CSRF] Token found in cookie:', cookieToken.substring(0, 10) + '...');
    return cookieToken;
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
    console.log('[CSRF] Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('[CSRF] Request method:', request.method);
    console.log('[CSRF] Request URL:', request.url);
    
    // Always require CSRF tokens for security, even in development
    return { valid: false, token: null, error: 'No CSRF token provided' };
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    console.log('[CSRF] Available tokens:', Array.from(csrfTokens.keys()).map(t => t.substring(0, 10) + '...'));
    console.log('[CSRF] Total tokens in storage:', csrfTokens.size);
    console.log('[CSRF] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Always reject invalid tokens for security
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
  
  // In development, allow multiple uses but still validate the token
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
  tokenData.protected = false; // Remove protection after use
  console.log(`[CSRF] Token validated successfully:`, token.substring(0, 10) + '...');
  
  return { valid: true, token };
}

// Funzione legacy per compatibilità (accetta stringa)
export function validateCSRFTokenString(token: string): boolean {
  if (!token) {
    console.log('[CSRF] No token provided');
    // Always require CSRF tokens for security
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    
    // Always reject invalid tokens for security
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
  tokenData.protected = false; // Remove protection after use
  console.log(`[CSRF] Token validated successfully:`, token.substring(0, 10) + '...');
  
  return true;
}

// Funzione per pulire i token scaduti (preserva quelli protetti)
function cleanupExpiredTokens(): void {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  let cleanedCount = 0;
  for (const [token, data] of csrfTokens.entries()) {
    // Don't clean protected tokens unless they're very old (2 hours)
    if (data.protected && (now - data.createdAt) < 2 * 60 * 60 * 1000) {
      continue;
    }
    
    // Clean expired tokens
    if ((now - data.createdAt) > maxAge) {
      csrfTokens.delete(token);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`[CSRF] Cleaned ${cleanedCount} expired tokens`);
  }
}

// Funzione per ottenere il numero di token
export function getCSRFTokenCount(): number {
  return csrfTokens.size;
}

// Funzione per pulire tutti i token (solo per debug)
export function clearCSRFTokens(): void {
  const count = csrfTokens.size;
  csrfTokens.clear();
  console.log(`[CSRF] Cleared ${count} tokens`);
}

// Funzione per debug dei token
export function debugCSRFTokens(): void {
  console.log(`[CSRF] Debug: ${csrfTokens.size} tokens in storage`);
  for (const [token, data] of csrfTokens.entries()) {
    const age = Date.now() - data.createdAt;
    console.log(`[CSRF] Token: ${token.substring(0, 10)}... | Age: ${Math.round(age / 1000)}s | Used: ${data.used} | Protected: ${data.protected}`);
  }
}

// Funzione per proteggere un token specifico (usata durante operazioni critiche)
export function protectCSRFToken(token: string): void {
  const tokenData = csrfTokens.get(token);
  if (tokenData) {
    tokenData.protected = true;
    console.log(`[CSRF] Protected token: ${token.substring(0, 10)}...`);
  }
}

// Funzione per rimuovere la protezione di un token
export function unprotectCSRFToken(token: string): void {
  const tokenData = csrfTokens.get(token);
  if (tokenData) {
    tokenData.protected = false;
    console.log(`[CSRF] Unprotected token: ${token.substring(0, 10)}...`);
  }
} 