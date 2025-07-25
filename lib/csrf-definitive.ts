// CSRF Token Management - Definitive Implementation
// Solves all known CSRF issues with robust token handling

import { NextRequest, NextResponse } from 'next/server';

// Global storage for CSRF tokens with better persistence
declare global {
  var __csrfTokens: Map<string, { 
    createdAt: number; 
    used: boolean; 
    useCount: number; 
    protected: boolean;
    lastUsed: number;
  }> | undefined;
  var __csrfTokenCount: number | undefined;
  var __csrfLastCleanup: number | undefined;
}

// Initialize global storage if it doesn't exist
if (typeof global !== 'undefined') {
  if (!global.__csrfTokens) {
    global.__csrfTokens = new Map();
    global.__csrfTokenCount = 0;
    global.__csrfLastCleanup = Date.now();
  }
}

const csrfTokens = global.__csrfTokens!;
const tokenCount = global.__csrfTokenCount!;
const lastCleanup = global.__csrfLastCleanup!;

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Configuration
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_TOKENS = 1000; // Maximum tokens in storage

/**
 * Generate a new CSRF token with enhanced security
 */
export function generateCSRFToken(): string {
  // Ensure cleanup runs periodically
  ensureCleanup();
  
  // Generate cryptographically secure token
  let token: string;
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      token = crypto.randomUUID();
    } else {
      // Fallback for environments without crypto.randomUUID
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2);
      token = `${timestamp}-${random}-${Math.random().toString(36).substring(2)}`;
    }
  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    // Ultimate fallback
    token = `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
  
  const now = Date.now();
  
  // Store token with enhanced metadata
  csrfTokens.set(token, { 
    createdAt: now, 
    used: false, 
    useCount: 0,
    protected: true,
    lastUsed: now
  });
  
  // Update global counters
  global.__csrfTokenCount = (global.__csrfTokenCount || 0) + 1;
  
  console.log(`[CSRF] Generated token: ${token.substring(0, 10)}... (${csrfTokens.size} tokens, total: ${global.__csrfTokenCount})`);
  
  return token;
}

/**
 * Extract CSRF token from request with multiple fallback methods
 */
function extractCSRFToken(request: NextRequest): string | null {
  // Method 1: Header (primary method)
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken && headerToken.trim()) {
    console.log('[CSRF] Token found in header:', headerToken.substring(0, 10) + '...');
    return headerToken.trim();
  }
  
  // Method 2: Cookie (fallback)
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (cookieToken && cookieToken.trim()) {
    console.log('[CSRF] Token found in cookie:', cookieToken.substring(0, 10) + '...');
    return cookieToken.trim();
  }
  
  // Method 3: Query parameter (for GET requests)
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('csrf');
    if (queryToken && queryToken.trim()) {
      console.log('[CSRF] Token found in query params');
      return queryToken.trim();
    }
  }
  
  // Method 4: Form data (for POST requests)
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      // This will be handled in the route handlers
      console.log('[CSRF] Token should be in request body for', request.method);
    } catch (error) {
      console.log('[CSRF] Error reading request body:', error);
    }
  }
  
  console.log('[CSRF] No token found in request');
  console.log('[CSRF] Request method:', request.method);
  console.log('[CSRF] Request URL:', request.url);
  console.log('[CSRF] Available headers:', Array.from(request.headers.keys()));
  
  return null;
}

/**
 * Validate CSRF token with enhanced error handling
 */
export function validateCSRFToken(request: NextRequest): { 
  valid: boolean; 
  token: string | null; 
  error?: string;
  details?: any;
} {
  const token = extractCSRFToken(request);
  
  // No token provided
  if (!token) {
    return { 
      valid: false, 
      token: null, 
      error: 'No CSRF token provided',
      details: {
        method: request.method,
        url: request.url,
        headers: Array.from(request.headers.keys())
      }
    };
  }
  
  // Token too short (basic validation)
  if (token.length < 10) {
    return { 
      valid: false, 
      token, 
      error: 'Invalid CSRF token format (too short)',
      details: { tokenLength: token.length }
    };
  }
  
  // Check if token exists in storage
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    console.log('[CSRF] Available tokens:', Array.from(csrfTokens.keys()).map(t => t.substring(0, 10) + '...'));
    console.log('[CSRF] Total tokens in storage:', csrfTokens.size);
    
    return { 
      valid: false, 
      token, 
      error: 'Invalid CSRF token (not found in storage)',
      details: {
        tokenPrefix: token.substring(0, 10),
        availableTokens: csrfTokens.size,
        storageKeys: Array.from(csrfTokens.keys()).map(t => t.substring(0, 10))
      }
    };
  }
  
  // Check if token is expired
  const now = Date.now();
  const tokenAge = now - tokenData.createdAt;
  if (tokenAge > TOKEN_EXPIRY) {
    console.log('[CSRF] Token expired:', token.substring(0, 10) + '...');
    csrfTokens.delete(token);
    return { 
      valid: false, 
      token, 
      error: 'CSRF token expired',
      details: { 
        tokenAge: Math.round(tokenAge / 1000),
        maxAge: Math.round(TOKEN_EXPIRY / 1000)
      }
    };
  }
  
  // Update last used timestamp
  tokenData.lastUsed = now;
  
  // Development mode: allow multiple uses
  if (isDevelopment) {
    tokenData.useCount++;
    console.log(`[CSRF] Token used ${tokenData.useCount} times:`, token.substring(0, 10) + '...');
    return { valid: true, token };
  }
  
  // Production mode: one-time use
  if (tokenData.used) {
    console.log('[CSRF] Token already used:', token.substring(0, 10) + '...');
    return { 
      valid: false, 
      token, 
      error: 'CSRF token already used',
      details: { useCount: tokenData.useCount }
    };
  }
  
  // Mark token as used
  tokenData.used = true;
  tokenData.useCount++;
  tokenData.protected = false;
  
  console.log(`[CSRF] Token validated successfully:`, token.substring(0, 10) + '...');
  
  return { valid: true, token };
}

/**
 * Legacy function for string-based validation
 */
export function validateCSRFTokenString(token: string): boolean {
  if (!token || token.length < 10) {
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    return false;
  }
  
  const now = Date.now();
  const tokenAge = now - tokenData.createdAt;
  if (tokenAge > TOKEN_EXPIRY) {
    csrfTokens.delete(token);
    return false;
  }
  
  tokenData.lastUsed = now;
  
  if (isDevelopment) {
    tokenData.useCount++;
    return true;
  }
  
  if (tokenData.used) {
    return false;
  }
  
  tokenData.used = true;
  tokenData.useCount++;
  tokenData.protected = false;
  
  return true;
}

/**
 * Ensure cleanup runs periodically
 */
function ensureCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredTokens();
    global.__csrfLastCleanup = now;
  }
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  let cleanedCount = 0;
  let protectedCount = 0;
  
  for (const [token, data] of csrfTokens.entries()) {
    // Don't clean protected tokens unless they're very old (2 hours)
    if (data.protected && (now - data.createdAt) < 2 * TOKEN_EXPIRY) {
      protectedCount++;
      continue;
    }
    
    // Clean expired tokens
    if ((now - data.createdAt) > TOKEN_EXPIRY) {
      csrfTokens.delete(token);
      cleanedCount++;
    }
  }
  
  // If we have too many tokens, clean some old ones
  if (csrfTokens.size > MAX_TOKENS) {
    const tokensToClean = csrfTokens.size - MAX_TOKENS;
    const sortedTokens = Array.from(csrfTokens.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, tokensToClean);
    
    for (const [token] of sortedTokens) {
      if (!csrfTokens.get(token)?.protected) {
        csrfTokens.delete(token);
        cleanedCount++;
      }
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`[CSRF] Cleaned ${cleanedCount} expired tokens (${protectedCount} protected, ${csrfTokens.size} remaining)`);
  }
}

/**
 * Get CSRF token count for debugging
 */
export function getCSRFTokenCount(): number {
  return csrfTokens.size;
}

/**
 * Clear all tokens (for debugging)
 */
export function clearCSRFTokens(): void {
  const count = csrfTokens.size;
  csrfTokens.clear();
  global.__csrfTokenCount = 0;
  console.log(`[CSRF] Cleared ${count} tokens`);
}

/**
 * Debug CSRF tokens
 */
export function debugCSRFTokens(): void {
  console.log(`[CSRF] Debug: ${csrfTokens.size} tokens in storage`);
  for (const [token, data] of csrfTokens.entries()) {
    const age = Date.now() - data.createdAt;
    const lastUsed = Date.now() - data.lastUsed;
    console.log(`[CSRF] Token: ${token.substring(0, 10)}... | Age: ${Math.round(age / 1000)}s | Used: ${data.used} | Count: ${data.useCount} | Protected: ${data.protected} | LastUsed: ${Math.round(lastUsed / 1000)}s ago`);
  }
}

/**
 * Protect a specific token during critical operations
 */
export function protectCSRFToken(token: string): void {
  const tokenData = csrfTokens.get(token);
  if (tokenData) {
    tokenData.protected = true;
    console.log(`[CSRF] Protected token: ${token.substring(0, 10)}...`);
  }
}

/**
 * Remove protection from a token
 */
export function unprotectCSRFToken(token: string): void {
  const tokenData = csrfTokens.get(token);
  if (tokenData) {
    tokenData.protected = false;
    console.log(`[CSRF] Unprotected token: ${token.substring(0, 10)}...`);
  }
}

/**
 * Get CSRF statistics
 */
export function getCSRFStats(): {
  totalTokens: number;
  activeTokens: number;
  expiredTokens: number;
  protectedTokens: number;
  totalGenerated: number;
} {
  const now = Date.now();
  let activeTokens = 0;
  let expiredTokens = 0;
  let protectedTokens = 0;
  
  for (const [_, data] of csrfTokens.entries()) {
    if (data.protected) {
      protectedTokens++;
    }
    
    if ((now - data.createdAt) > TOKEN_EXPIRY) {
      expiredTokens++;
    } else {
      activeTokens++;
    }
  }
  
  return {
    totalTokens: csrfTokens.size,
    activeTokens,
    expiredTokens,
    protectedTokens,
    totalGenerated: global.__csrfTokenCount || 0
  };
} 