// CSRF Client Utilities
interface CSRFToken {
  token: string;
  expiresIn: number;
  createdAt: number;
}

class CSRFManager {
  private static instance: CSRFManager;
  private tokenCache: Map<string, CSRFToken> = new Map();
  private readonly STORAGE_KEY = 'csrf_token';
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  private constructor() {}

  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager();
    }
    return CSRFManager.instance;
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

  // Generate a new CSRF token
  async generateToken(): Promise<string> {
    try {
      // Try to get token from server first
      const response = await fetch('/api/csrf-public', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const tokenData: CSRFToken = {
          token: data.token,
          expiresIn: data.expiresIn * 1000, // Convert to milliseconds
          createdAt: Date.now()
        };

        // Store in memory cache
        this.tokenCache.set(tokenData.token, tokenData);
        
        // Store in localStorage
        this.storeToken(tokenData);

        return tokenData.token;
      } else {
        // If server is not available, generate token locally
        console.warn('CSRF server endpoint not available, generating token locally');
        return this.generateTokenLocally();
      }
    } catch (error) {
      console.warn('Error getting CSRF token from server, generating locally:', error);
      return this.generateTokenLocally();
    }
  }

  // Generate token locally when server is not available
  private generateTokenLocally(): string {
    const token = this.generateLocalToken();
    const tokenData: CSRFToken = {
      token,
      expiresIn: 60 * 60 * 1000, // 1 hour in milliseconds
      createdAt: Date.now()
    };

    // Store in memory cache
    this.tokenCache.set(token, tokenData);
    
    // Store in localStorage
    this.storeToken(tokenData);

    console.log('Generated local CSRF token:', token.substring(0, 10) + '...');
    return token;
  }

  // Get existing token or generate new one
  async getToken(): Promise<string> {
    // Check localStorage first
    const storedToken = this.getStoredToken();
    if (storedToken && this.isTokenValid(storedToken)) {
      return storedToken.token;
    }

    // Check memory cache
    for (const [token, tokenData] of this.tokenCache.entries()) {
      if (this.isTokenValid(tokenData)) {
        return token;
      }
    }

    // Generate new token if none valid
    return this.generateToken();
  }

  // Store token in localStorage
  private storeToken(tokenData: CSRFToken): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.warn('Failed to store CSRF token in localStorage:', error);
    }
  }

  // Get token from localStorage
  private getStoredToken(): CSRFToken | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to retrieve CSRF token from localStorage:', error);
    }
    return null;
  }

  // Check if token is still valid
  private isTokenValid(tokenData: CSRFToken): boolean {
    const now = Date.now();
    const expiryTime = tokenData.createdAt + tokenData.expiresIn - this.TOKEN_EXPIRY_BUFFER;
    return now < expiryTime;
  }

  // Remove a specific token
  removeToken(token: string): void {
    this.tokenCache.delete(token);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove CSRF token from localStorage:', error);
    }
  }

  // Clear all tokens
  clearAllTokens(): void {
    this.tokenCache.clear();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear CSRF tokens from localStorage:', error);
    }
  }
}

// Export singleton instance
export const csrfManager = CSRFManager.getInstance();

// Fetch with CSRF token
export async function fetchWithCSRF(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await csrfManager.getToken();
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
    credentials: 'include'
  };
  return fetch(url, enhancedOptions);
}

// Fetch FormData with CSRF token
export async function fetchFormDataWithCSRF(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await csrfManager.getToken();
  const enhancedOptions: RequestInit = {
    ...options,
    method: options.method || 'POST',
    headers: {
      ...options.headers,
      'X-CSRF-Token': token,
    },
    credentials: 'include'
  };
  return fetch(url, enhancedOptions);
}

// Fetch JSON with CSRF token
export async function fetchJSONWithCSRF<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithCSRF(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Utility function to fetch profile data
export async function fetchProfile(): Promise<any> {
  const response = await fetchWithCSRF('/api/profile');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Check if user has valid session
export function checkSession(): boolean {
  try {
    const token = localStorage.getItem('csrf_token');
    return !!token;
  } catch {
    return false;
  }
}

// Cleanup on logout
export function cleanupOnLogout(): void {
  csrfManager.clearAllTokens();
} 