// CSRF token management - Edge Runtime compatible
const csrfTokens = new Set<string>();

export function generateCSRFToken(): string {
  // Use Math.random() which is available in Edge Runtime
  const token = Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
  csrfTokens.add(token);
  return token;
}

export function validateCSRFToken(token: string): boolean {
  if (!token || !csrfTokens.has(token)) {
    return false;
  }
  
  // Rimuovi il token dopo l'uso (one-time use)
  csrfTokens.delete(token);
  return true;
}

export function clearExpiredTokens(): void {
  // In produzione, implementare pulizia automatica dei token scaduti
  // Per ora, manteniamo tutti i token in memoria
} 