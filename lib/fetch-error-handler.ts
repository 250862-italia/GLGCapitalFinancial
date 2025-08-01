// Comprehensive fetch error handler for GLG Capital Group
// Handles all types of fetch errors including network, timeout, and authentication issues

export interface FetchError {
  type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'SERVER' | 'BUILD_ERROR' | 'UNKNOWN';
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface FetchResponse<T = any> {
  data: T | null;
  error: FetchError | null;
  success: boolean;
}

// Network error detection
const isNetworkError = (error: any): boolean => {
  const networkErrors = [
    'fetch failed',
    'TypeError: fetch failed',
    'Network error',
    'ERR_NAME_NOT_RESOLVED',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'Failed to fetch',
    'Network request failed'
  ];
  
  return networkErrors.some(networkError => 
    error?.message?.includes(networkError) || 
    error?.toString().includes(networkError) ||
    error?.name?.includes(networkError)
  );
};

// Timeout error detection
const isTimeoutError = (error: any): boolean => {
  return error?.name === 'AbortError' || 
         error?.message?.includes('timeout') ||
         error?.message?.includes('timed out');
};

// Authentication error detection
const isAuthError = (error: any): boolean => {
  return error?.status === 401 || 
         error?.status === 403 ||
         error?.code === 'invalid_credentials' ||
         error?.message?.includes('unauthorized') ||
         error?.message?.includes('forbidden');
};

// Server error detection
const isServerError = (error: any): boolean => {
  return error?.status >= 500 || 
         error?.message?.includes('Internal Server Error') ||
         error?.message?.includes('server error');
};

// Enhanced fetch with comprehensive error handling
export const safeFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  context: string = 'API Call',
  timeout: number = 10000
): Promise<FetchResponse<T>> => {
  
  // Check build health first (if in browser)
  if (typeof window !== 'undefined') {
    try {
      const { checkBuildHealth } = await import('./build-error-detector');
      const buildHealth = checkBuildHealth();
      if (!buildHealth.healthy) {
        console.error(`🚨 [${context}] Build errors detected, skipping fetch`);
        return {
          data: null,
          error: {
            type: 'BUILD_ERROR',
            message: 'Build errors prevent API calls',
            details: buildHealth.errors
          },
          success: false
        };
      }
    } catch (e) {
      console.warn(`⚠️ [${context}] Build health check failed:`, e);
    }
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`🌐 [${context}] Making request to:`, url);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let errorType: FetchError['type'] = 'UNKNOWN';
      let errorMessage = errorData.message || `HTTP ${response.status}`;
      
      if (response.status === 401 || response.status === 403) {
        errorType = 'AUTH';
        errorMessage = 'Authentication failed. Please login again.';
      } else if (response.status >= 500) {
        errorType = 'SERVER';
        errorMessage = 'Server error. Please try again later.';
      } else if (response.status === 404) {
        errorType = 'SERVER';
        errorMessage = 'Resource not found.';
      }

      const error: FetchError = {
        type: errorType,
        message: errorMessage,
        status: response.status,
        details: errorData
      };

      console.error(`❌ [${context}] Request failed:`, error);
      
      return {
        data: null,
        error,
        success: false
      };
    }

    const data = await response.json();
    console.log(`✅ [${context}] Request successful`);
    
    return {
      data,
      error: null,
      success: true
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ [${context}] Fetch error:`, error);
    
    let errorType: FetchError['type'] = 'UNKNOWN';
    let errorMessage = 'An unexpected error occurred';
    
    if (isNetworkError(error)) {
      errorType = 'NETWORK';
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (isTimeoutError(error)) {
      errorType = 'TIMEOUT';
      errorMessage = 'Request timed out. Please try again.';
    } else if (isAuthError(error)) {
      errorType = 'AUTH';
      errorMessage = 'Authentication failed. Please login again.';
    } else if (isServerError(error)) {
      errorType = 'SERVER';
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = error?.message || 'An unexpected error occurred';
    }

    const fetchError: FetchError = {
      type: errorType,
      message: errorMessage,
      details: error
    };

    return {
      data: null,
      error: fetchError,
      success: false
    };
  }
};

// Retry mechanism for failed requests
export const fetchWithRetry = async <T = any>(
  url: string,
  options: RequestInit = {},
  context: string = 'API Call',
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<FetchResponse<T>> => {
  let lastError: FetchError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [${context}] Attempt ${attempt}/${maxRetries}`);
    
    const result = await safeFetch<T>(url, options, context);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    // Don't retry auth errors or server errors
    if (result.error?.type === 'AUTH' || result.error?.type === 'SERVER') {
      break;
    }
    
    // Wait before retrying (except for the last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  return {
    data: null,
    error: lastError,
    success: false
  };
};

// Fallback data for offline mode
export const getFallbackData = <T>(context: string): T | null => {
  console.log(`📦 [${context}] Using fallback data (offline mode)`);
  
  // Return appropriate fallback data based on context
  switch (context) {
    case 'investments':
      return [] as any;
    case 'users':
      return [] as any;
    case 'clients':
      return [] as any;
    default:
      return null;
  }
};

// Enhanced API call with fallback
export const apiCallWithFallback = async <T = any>(
  url: string,
  options: RequestInit = {},
  context: string = 'API Call'
): Promise<FetchResponse<T>> => {
  const result = await fetchWithRetry<T>(url, options, context);
  
  if (!result.success && result.error?.type === 'NETWORK') {
    // Use fallback data for network errors
    const fallbackData = getFallbackData<T>(context);
    return {
      data: fallbackData,
      error: null,
      success: true
    };
  }
  
  return result;
};

// Utility to check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Utility to check if we're in a build environment
export const isBuildTime = typeof window === 'undefined';

// Skip API calls during build time
export const skipDuringBuild = <T>(fallback: T): FetchResponse<T> => {
  if (isBuildTime) {
    console.log('🏗️ Build time detected, skipping API call');
    return {
      data: fallback,
      error: null,
      success: true
    };
  }
  
  return {
    data: null,
    error: null,
    success: false
  };
}; 