// Enhanced fetch error handler for GLG Capital Group
export interface FetchError {
  type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'SERVER' | 'UNKNOWN';
  message: string;
  code?: string;
  details?: any;
}

export interface FetchResult<T = any> {
  data: T | null;
  error: FetchError | null;
  success: boolean;
}

// Check if we're in a build environment
const isBuildTime = () => {
  return typeof window === 'undefined' || 
         process.env.NODE_ENV === 'production' && 
         process.env.VERCEL_ENV === 'production';
};

// Enhanced fetch with comprehensive error handling
export async function safeFetch(
  url: string, 
  options: RequestInit = {}, 
  context: string = 'unknown'
): Promise<FetchResult> {
  
  // Skip fetch during build time
  if (isBuildTime()) {
    console.log(`[${context}] Build time detected, skipping fetch`);
    return {
      data: null,
      error: null,
      success: true
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
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
      
      if (response.status === 401) {
        return {
          data: null,
          error: {
            type: 'AUTH',
            message: 'Authentication required',
            code: '401',
            details: errorData
          },
          success: false
        };
      }

      return {
        data: null,
        error: {
          type: 'SERVER',
          message: `Server error: ${response.status}`,
          code: response.status.toString(),
          details: errorData
        },
        success: false
      };
    }

    const data = await response.json().catch(() => null);
    return {
      data,
      error: null,
      success: true
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Network error detection
    const isNetworkError = error?.message?.includes('fetch failed') ||
                          error?.message?.includes('Network error') ||
                          error?.message?.includes('ERR_NAME_NOT_RESOLVED') ||
                          error?.message?.includes('ENOTFOUND') ||
                          error?.message?.includes('ECONNREFUSED') ||
                          error?.message?.includes('ETIMEDOUT') ||
                          error?.message?.includes('ERR_NETWORK') ||
                          error?.name === 'AbortError';

    if (isNetworkError) {
      return {
        data: null,
        error: {
          type: 'NETWORK',
          message: 'Network connection failed',
          code: 'NETWORK_ERROR',
          details: error.message
        },
        success: false
      };
    }

    return {
      data: null,
      error: {
        type: 'UNKNOWN',
        message: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        details: error.message
      },
      success: false
    };
  }
}

// Retry mechanism for failed requests
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  context: string = 'unknown'
): Promise<FetchResult> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await safeFetch(url, options, context);
    
    if (result.success) {
      return result;
    }
    
    // Don't retry auth errors
    if (result.error?.type === 'AUTH') {
      return result;
    }
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    data: null,
    error: {
      type: 'NETWORK',
      message: `Failed after ${maxRetries} attempts`,
      code: 'MAX_RETRIES_EXCEEDED'
    },
    success: false
  };
}

// API call wrapper with fallback data
export async function apiCallWithFallback<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: T,
  context: string = 'unknown'
): Promise<{ data: T; error: FetchError | null }> {
  
  const result = await fetchWithRetry(url, options, 2, context);
  
  if (result.success && result.data) {
    return { data: result.data, error: null };
  }
  
  console.warn(`[${context}] Using fallback data due to fetch error:`, result.error);
  return { data: fallbackData, error: result.error };
}

// Skip fetch during build time
export function skipDuringBuild<T>(callback: () => T, fallback: T): T {
  if (isBuildTime()) {
    console.log('Build time detected, using fallback value');
    return fallback;
  }
  return callback();
} 