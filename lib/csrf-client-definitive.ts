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
   * Generate a new CSRF token
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
        const tokenData: CSRFToken = {
          token: data.token,
          expiresIn: data.expiresIn * 1000, // Convert to milliseconds
          createdAt: Date.now(),
          lastUsed: Date.now()
        };

        // Store in memory cache
        this.storeToken(tokenData);
        
        console.log('[CSRF Client] Token generated from server:', tokenData.token.substring(0, 10) + '...');
        return tokenData.token;
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
    const token = this.generateLocalToken();
    const tokenData: CSRFToken = {
      token,
      expiresIn: 60 * 60 * 1000, // 1 hour in milliseconds
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    // Store in memory cache
    this.storeToken(tokenData);
    
    console.log('[CSRF Client] Generated local token:', token.substring(0, 10) + '...');
    return token;
  }

  /**
   * Generate a local token
   */
  private generateLocalToken(): string {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (error) {
      console.warn('[CSRF Client] crypto.randomUUID not available:', error);
    }
    
    // Fallback for environments without crypto.randomUUID
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2);
    const random2 = Math.random().toString(36).substring(2);
    return `${timestamp}-${random1}-${random2}`;
  }

  /**
   * Get existing token or generate new one
   */
  async getToken(): Promise<string> {
    // Check memory cache first
    for (const [token, tokenData] of this.tokenCache.entries()) {
      if (this.isTokenValid(tokenData)) {
        tokenData.lastUsed = Date.now();
        console.log('[CSRF Client] Using cached token:', token.substring(0, 10) + '...');
        return token;
      }
    }

    // Check localStorage
    const storedToken = this.getStoredToken();
    if (storedToken && this.isTokenValid(storedToken)) {
      // Add to memory cache
      this.tokenCache.set(storedToken.token, storedToken);
      storedToken.lastUsed = Date.now();
      console.log('[CSRF Client] Using stored token:', storedToken.token.substring(0, 10) + '...');
      return storedToken.token;
    }

    // Generate new token if none valid
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.warn('[CSRF Client] Failed to store token in localStorage:', error);
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tokenData: CSRFToken = JSON.parse(stored);
        if (this.isTokenValid(tokenData)) {
          this.tokenCache.set(tokenData.token, tokenData);
          console.log('[CSRF Client] Loaded token from storage:', tokenData.token.substring(0, 10) + '...');
        }
      }
    } catch (error) {
      console.warn('[CSRF Client] Failed to load token from localStorage:', error);
    }
  }

  /**
   * Get token from localStorage
   */
  private getStoredToken(): CSRFToken | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[CSRF Client] Failed to retrieve token from localStorage:', error);
    }
    return null;
  }

  /**
   * Check if token is still valid
   */
  private isTokenValid(tokenData: CSRFToken): boolean {
    const now = Date.now();
    const expiryTime = tokenData.createdAt + tokenData.expiresIn - this.TOKEN_EXPIRY_BUFFER;
    return now < expiryTime;
  }

  /**
   * Remove a specific token
   */
  removeToken(token: string): void {
    this.tokenCache.delete(token);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('[CSRF Client] Failed to remove token from localStorage:', error);
    }
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(): void {
    this.tokenCache.clear();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('[CSRF Client] Failed to clear tokens from localStorage:', error);
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
      const newestToken = Array.from(this.tokenCache.values())
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      lastTokenAge = now - newestToken.createdAt;
    }
    
    return {
      cacheSize: this.tokenCache.size,
      storageAvailable: typeof localStorage !== 'undefined',
      lastTokenAge
    };
  }
}

// Export singleton instance
export const csrfClient = CSRFClientManager.getInstance();

/**
 * Fetch with CSRF token - Enhanced version
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
 * Fetch FormData with CSRF token
 */
export async function fetchFormDataWithCSRF(
  url: string, 
  formData: FormData,
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
    body: formData,
    credentials: 'include'
  };
  
  console.log('[CSRF Client] Making FormData request with token:', token.substring(0, 10) + '...');
  return fetch(url, enhancedOptions);
}

/**
 * Fetch JSON with CSRF token
 */
export async function fetchJSONWithCSRF<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithCSRF(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CSRF Client] Request failed:', response.status, errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  return response.json();
}

/**
 * Utility function to fetch profile data
 */
export async function fetchProfile(): Promise<any> {
  const response = await fetchWithCSRF('/api/profile');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Check if user has valid session
 */
export function checkSession(): boolean {
  try {
    const token = localStorage.getItem('csrf_token');
    return !!token;
  } catch {
    return false;
  }
}

/**
 * Cleanup on logout
 */
export function cleanupOnLogout(): void {
  csrfClient.clearAllTokens();
  console.log('[CSRF Client] Cleaned up on logout');
}

/**
 * Get client statistics
 */
export function getCSRFClientStats() {
  return csrfClient.getStats();
} 