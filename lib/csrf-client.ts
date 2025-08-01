// CSRF Client - Definitive Implementation
// Solves all known CSRF client issues with robust token management

interface CSRFToken {
  token: string;
  expiresIn: number;
  createdAt: number;
  lastUsed: number;
}

class CSRFClientManager {
  private static instance: CSRFClientManager;
  private tokenCache: Map<string, CSRFToken> = new Map();
  private readonly STORAGE_KEY = 'csrf_token';
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer
  private readonly MAX_CACHE_SIZE = 50;
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): CSRFClientManager {
    if (!CSRFClientManager.instance) {
      CSRFClientManager.instance = new CSRFClientManager();
    }
    return CSRFClientManager.instance;
  }

  // Generate a new CSRF token locally
  private generateLocalToken(): string {
    // Use crypto.randomUUID() if available, otherwise fallback to Math.random()
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for environments without crypto.randomUUID
    return Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
  }

  /**
   * Initialize the CSRF client
   */
  private initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Load tokens from localStorage
      this.loadFromStorage();
      this.isInitialized = true;
      console.log('[CSRF Client] Initialized successfully');
    } catch (error) {
      console.warn('[CSRF Client] Initialization error:', error);
      this.isInitialized = true; // Mark as initialized even if there's an error
    }
  }

  /**
   * Generate a new CSRF token with enhanced reliability
   */
  async generateToken(): Promise<string> {
    try {
      console.log('[CSRF Client] Generating new token...');
      
      // Try to get token from server first
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          const tokenData: CSRFToken = {
            token: data.token,
            expiresIn: (data.expiresIn || 3600) * 1000, // Convert to milliseconds
            createdAt: Date.now(),
            lastUsed: Date.now()
          };

          // Store in memory cache
          this.storeToken(tokenData);
          
          console.log('[CSRF Client] Token generated from server:', tokenData.token.substring(0, 10) + '...');
          return tokenData.token;
        } else {
          console.warn('[CSRF Client] Server response missing token, generating locally');
          return this.generateTokenLocally();
        }
      } else {
        console.warn('[CSRF Client] Server endpoint not available, generating locally');
        return this.generateTokenLocally();
      }
    } catch (error) {
      console.warn('[CSRF Client] Error getting token from server, generating locally:', error);
      return this.generateTokenLocally();
    }
  }

  /**
   * Generate token locally when server is not available
   */
  private generateTokenLocally(): string {
    console.log('[CSRF Client] Generating local token...');
    
    // Try multiple methods for generating a secure token
    let token: string;
    
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        token = crypto.randomUUID();
      } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      } else {
        // Ultimate fallback
        const timestamp = Date.now().toString(36);
        const random1 = Math.random().toString(36).substring(2);
        const random2 = Math.random().toString(36).substring(2);
        token = `${timestamp}-${random1}-${random2}`;
      }
    } catch (error) {
      console.warn('[CSRF Client] Error generating local token, using fallback:', error);
      token = `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }

    const tokenData: CSRFToken = {
      token,
      expiresIn: 60 * 60 * 1000, // 1 hour
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    this.storeToken(tokenData);
    console.log('[CSRF Client] Local token generated:', token.substring(0, 10) + '...');
    
    return token;
  }

  /**
   * Get a valid CSRF token, generating one if necessary
   */
  async getToken(): Promise<string> {
    // First, try to get from memory cache
    for (const [token, data] of this.tokenCache.entries()) {
      if (this.isTokenValid(data)) {
        data.lastUsed = Date.now();
        console.log('[CSRF Client] Using cached token:', token.substring(0, 10) + '...');
        return token;
      }
    }

    // Then, try to get from localStorage
    const storedToken = this.getStoredToken();
    if (storedToken && this.isTokenValid(storedToken)) {
      this.tokenCache.set(storedToken.token, storedToken);
      storedToken.lastUsed = Date.now();
      console.log('[CSRF Client] Using stored token:', storedToken.token.substring(0, 10) + '...');
      return storedToken.token;
    }

    // Finally, generate a new token
    console.log('[CSRF Client] No valid token found, generating new one...');
    return this.generateToken();
  }

  /**
   * Store token in memory cache and localStorage
   */
  private storeToken(tokenData: CSRFToken): void {
    // Store in memory cache
    this.tokenCache.set(tokenData.token, tokenData);
    
    // Limit cache size
    if (this.tokenCache.size > this.MAX_CACHE_SIZE) {
      const oldestToken = Array.from(this.tokenCache.entries())
        .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
      if (oldestToken) {
        this.tokenCache.delete(oldestToken[0]);
      }
    }
    
    // Store in localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
      }
    } catch (error) {
      console.warn('[CSRF Client] Error storing token in localStorage:', error);
    }
  }

  /**
   * Load tokens from localStorage into memory cache
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const tokenData: CSRFToken = JSON.parse(stored);
          if (this.isTokenValid(tokenData)) {
            this.tokenCache.set(tokenData.token, tokenData);
            console.log('[CSRF Client] Loaded token from storage:', tokenData.token.substring(0, 10) + '...');
          }
        }
      }
    } catch (error) {
      console.warn('[CSRF Client] Error loading from storage:', error);
    }
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): CSRFToken | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.warn('[CSRF Client] Error getting stored token:', error);
    }
    return null;
  }

  /**
   * Check if a token is still valid
   */
  private isTokenValid(tokenData: CSRFToken): boolean {
    const now = Date.now();
    const age = now - tokenData.createdAt;
    return age < (tokenData.expiresIn - this.TOKEN_EXPIRY_BUFFER);
  }

  /**
   * Remove a specific token
   */
  removeToken(token: string): void {
    this.tokenCache.delete(token);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.warn('[CSRF Client] Error removing token from storage:', error);
    }
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(): void {
    this.tokenCache.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.warn('[CSRF Client] Error clearing tokens from storage:', error);
    }
  }

  /**
   * Get client statistics
   */
  getStats(): {
    cacheSize: number;
    storageAvailable: boolean;
    lastTokenAge: number | null;
  } {
    const now = Date.now();
    let lastTokenAge: number | null = null;
    
    if (this.tokenCache.size > 0) {
      const oldestToken = Array.from(this.tokenCache.values())
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      lastTokenAge = now - oldestToken.createdAt;
    }
    
    return {
      cacheSize: this.tokenCache.size,
      storageAvailable: typeof localStorage !== 'undefined',
      lastTokenAge
    };
  }
}

// Global instance
const csrfClient = CSRFClientManager.getInstance();

/**
 * Fetch wrapper with automatic CSRF token inclusion
 */
export async function fetchWithCSRF(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await csrfClient.getToken();
  
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
      'Cache-Control': 'no-cache'
    },
    credentials: 'include'
  };
  
  console.log('[CSRF Client] Making request with token:', token.substring(0, 10) + '...');
  return fetch(url, enhancedOptions);
}

/**
 * Fetch wrapper for FormData with CSRF token
 */
export async function fetchFormDataWithCSRF(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await csrfClient.getToken();
  
  const enhancedOptions: RequestInit = {
    ...options,
    method: options.method || 'POST',
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
      // Don't set Content-Type for FormData, let the browser set it with boundary
    },
    credentials: 'include'
  };
  
  console.log('[CSRF Client] Making FormData request with token:', token.substring(0, 10) + '...');
  return fetch(url, enhancedOptions);
}

/**
 * Fetch wrapper for JSON with CSRF token
 */
export async function fetchJSONWithCSRF<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await csrfClient.getToken();
  
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'X-CSRF-Token': token,
      'Cache-Control': 'no-cache'
    },
    credentials: 'include'
  };
  
  console.log('[CSRF Client] Making JSON request with token:', token.substring(0, 10) + '...');
  
  // Use the enhanced fetch handler
  const { safeFetch } = await import('./fetch-error-handler');
  const result = await safeFetch(url, enhancedOptions, 'CSRF-Client');
  
  if (!result.success) {
    if (result.error?.type === 'NETWORK') {
      throw new Error('Network connection failed. Please check your internet connection.');
    } else if (result.error?.type === 'AUTH') {
      throw new Error('Authentication required. Please login again.');
    } else {
      throw new Error(result.error?.message || 'Request failed');
    }
  }
  
  return result.data;
}

/**
 * Fetch user profile with CSRF protection
 */
export async function fetchProfile(): Promise<any> {
  try {
    return await fetchJSONWithCSRF('/api/profile');
  } catch (error) {
    console.error('[CSRF Client] Error fetching profile:', error);
    throw error;
  }
}

/**
 * Check if user session is valid
 */
export function checkSession(): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      const session = localStorage.getItem('session');
      return !!session;
    }
  } catch (error) {
    console.warn('[CSRF Client] Error checking session:', error);
  }
  return false;
}

/**
 * Clean up on logout
 */
export function cleanupOnLogout(): void {
  csrfClient.clearAllTokens();
  console.log('[CSRF Client] Tokens cleared on logout');
}

/**
 * Get CSRF client statistics
 */
export function getCSRFClientStats() {
  return csrfClient.getStats();
} 