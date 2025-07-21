// Client-side CSRF token management
// Automatically handles CSRF tokens for all API requests

class CSRFClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private isFetching: boolean = false;
  private fetchPromise: Promise<string> | null = null;

  // Get CSRF token, fetching if necessary
  async getToken(): Promise<string> {
    const now = Date.now();
    
    // If we have a valid token, return it
    if (this.token && now < this.tokenExpiry) {
      console.log('[CSRF Client] Using cached token:', this.token.substring(0, 10) + '...');
      return this.token;
    }

    // If we're already fetching, wait for that promise
    if (this.isFetching && this.fetchPromise) {
      console.log('[CSRF Client] Waiting for existing token fetch...');
      return this.fetchPromise;
    }

    // Fetch new token
    console.log('[CSRF Client] Fetching new CSRF token...');
    this.isFetching = true;
    this.fetchPromise = this.fetchNewToken();
    
    try {
      this.token = await this.fetchPromise;
      this.tokenExpiry = now + (55 * 60 * 1000); // 55 minutes (5 min buffer)
      console.log('[CSRF Client] Token fetched and cached:', this.token.substring(0, 10) + '...');
      return this.token;
    } finally {
      this.isFetching = false;
      this.fetchPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    try {
      console.log('[CSRF Client] Making request to /api/csrf...');
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache', // Ensure we don't get cached responses
      });

      console.log('[CSRF Client] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CSRF Client] Response data:', data);
      
      if (!data.token) {
        throw new Error('No CSRF token in response');
      }

      console.log('[CSRF Client] Token fetched successfully:', data.token.substring(0, 10) + '...');
      return data.token;
    } catch (error) {
      console.error('[CSRF Client] Error fetching token:', error);
      
      // In development, return a fallback token
      if (process.env.NODE_ENV === 'development') {
        console.log('[CSRF Client] Using fallback token for development');
        const fallbackToken = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('[CSRF Client] Fallback token:', fallbackToken);
        return fallbackToken;
      }
      throw error;
    }
  }

  // Clear current token (force refresh on next request)
  clearToken(): void {
    console.log('[CSRF Client] Clearing cached token');
    this.token = null;
    this.tokenExpiry = 0;
  }

  // Enhanced fetch with automatic CSRF token
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const token = await this.getToken();
      console.log('[CSRF Client] Adding CSRF token to request:', token.substring(0, 10) + '...');
      
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
      };

      console.log('[CSRF Client] Making request to:', url);
      const response = await fetch(url, enhancedOptions);
      console.log('[CSRF Client] Response status:', response.status);
      
      return response;
    } catch (error) {
      console.error('[CSRF Client] Error in enhanced fetch:', error);
      
      // In development, try without CSRF token as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('[CSRF Client] Development fallback: trying without CSRF token');
        return fetch(url, options);
      }
      
      throw error;
    }
  }

  // Helper for JSON requests
  async fetchJSON(url: string, options: RequestInit = {}): Promise<Response> {
    const enhancedOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    return this.fetch(url, enhancedOptions);
  }

  // Helper for FormData requests (file uploads)
  async fetchFormData(url: string, options: RequestInit = {}): Promise<Response> {
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const enhancedOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        // Remove Content-Type if it's set to application/json
        ...(options.headers && typeof options.headers === 'object' && 'Content-Type' in options.headers && 
            options.headers['Content-Type'] === 'application/json' ? {} : {})
      },
    };

    return this.fetch(url, enhancedOptions);
  }
}

// Create singleton instance
export const csrfClient = new CSRFClient();

// Export convenience functions
export const fetchWithCSRF = (url: string, options?: RequestInit) => csrfClient.fetch(url, options);
export const fetchJSONWithCSRF = (url: string, options?: RequestInit) => csrfClient.fetchJSON(url, options);
export const fetchFormDataWithCSRF = (url: string, options?: RequestInit) => csrfClient.fetchFormData(url, options);
export const getCSRFToken = () => csrfClient.getToken(); 