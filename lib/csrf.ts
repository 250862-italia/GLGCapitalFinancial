// CSRF token management - Edge Runtime compatible
// Use a more persistent storage approach for development

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

export function validateCSRFToken(token: string): boolean {
  if (!token) {
    console.log('[CSRF] No token provided');
    return false;
  }
  
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    console.log('[CSRF] Token not found in storage:', token.substring(0, 10) + '...');
    console.log('[CSRF] Available tokens:', Array.from(csrfTokens.keys()).map(t => t.substring(0, 10) + '...'));
    
    // In development, allow some flexibility for testing
    if (isDevelopment) {
      console.log('[CSRF] Development mode: allowing request despite missing token');
      return true;
    }
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