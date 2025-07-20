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
      return this.token;
    }

    // If we're already fetching, wait for that promise
    if (this.isFetching && this.fetchPromise) {
      return this.fetchPromise;
    }

    // Fetch new token
    this.isFetching = true;
    this.fetchPromise = this.fetchNewToken();
    
    try {
      this.token = await this.fetchPromise;
      this.tokenExpiry = now + (55 * 60 * 1000); // 55 minutes (5 min buffer)
      return this.token;
    } finally {
      this.isFetching = false;
      this.fetchPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No CSRF token in response');
      }

      console.log('[CSRF Client] Token fetched successfully');
      return data.token;
    } catch (error) {
      console.error('[CSRF Client] Error fetching token:', error);
      // In development, return a fallback token
      if (process.env.NODE_ENV === 'development') {
        console.log('[CSRF Client] Using fallback token for development');
        return `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      throw error;
    }
  }

  // Clear current token (force refresh on next request)
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }

  // Enhanced fetch with automatic CSRF token
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const token = await this.getToken();
      
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
      };

      return fetch(url, enhancedOptions);
    } catch (error) {
      console.error('[CSRF Client] Error in enhanced fetch:', error);
      // Fallback to regular fetch if CSRF fails
      return fetch(url, options);
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