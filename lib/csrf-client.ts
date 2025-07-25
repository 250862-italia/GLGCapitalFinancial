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

  // Generate a new CSRF token
  async generateToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-public', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }

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
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      throw error;
    }
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

  // Remove token from storage
  removeToken(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.tokenCache.clear();
    } catch (error) {
      console.warn('Failed to remove CSRF token from localStorage:', error);
    }
  }

  // Clear all tokens (useful for logout)
  clearAllTokens(): void {
    this.removeToken();
    this.tokenCache.clear();
  }
}

// Export singleton instance
export const csrfManager = CSRFManager.getInstance();

// Enhanced fetch functions with CSRF
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
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  return fetch(url, enhancedOptions);
}

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
      // Don't set Content-Type for FormData, let the browser set it with boundary
    },
    credentials: 'include'
  };

  return fetch(url, enhancedOptions);
}

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

// Profile management with CSRF
export async function fetchProfile(): Promise<any> {
  try {
    const response = await fetchJSONWithCSRF('/api/auth/profile');
    return response;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// Session management
export function checkSession(): boolean {
  // Check if we have a valid session
  // This could be enhanced to actually verify with the server
  const storedToken = csrfManager.getStoredToken();
  return storedToken !== null;
}

// Cleanup on logout
export function cleanupOnLogout(): void {
  csrfManager.clearAllTokens();
} 