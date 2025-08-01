// Comprehensive fetch error handler with enhanced error prevention
interface FetchResult<T = any> {
  data: T | null;
  error: {
    type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'SERVER' | 'UNKNOWN';
    message: string;
    code?: string;
    details?: any;
  } | null;
  success: boolean;
}

// Detect if we're in build time
const isBuildTime = (): boolean => {
  return typeof window === 'undefined' && 
         (process.env.NODE_ENV === 'production' || 
          process.env.VERCEL_ENV === 'production');
};

// Enhanced fetch with comprehensive error handling and prevention
export async function safeFetch(
  url: string, 
  options: RequestInit = {}, 
  context: string = 'unknown'
): Promise<FetchResult> {
  
  // Skip fetch during build time to prevent errors
  if (isBuildTime()) {
    console.log(`[${context}] Build time detected, skipping fetch to prevent errors`);
    return {
      data: null,
      error: null,
      success: true
    };
  }

  // Skip fetch if URL is invalid
  if (!url || typeof url !== 'string') {
    console.log(`[${context}] Invalid URL provided:`, url);
    return {
      data: null,
      error: {
        type: 'UNKNOWN',
        message: 'Invalid URL provided',
        code: 'INVALID_URL'
      },
      success: false
    };
  }

  // Skip fetch for mock URLs
  if (url.includes('mock.supabase.co') || url.includes('localhost:54321')) {
    console.log(`[${context}] Mock URL detected, skipping fetch`);
    return {
      data: null,
      error: null,
      success: true
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    console.log(`[${context}] Attempting fetch to:`, url);
    
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
    console.log(`[${context}] Fetch successful`);
    
    return {
      data,
      error: null,
      success: true
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`[${context}] Fetch error:`, error);
    
    // Enhanced error classification
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        data: null,
        error: {
          type: 'TIMEOUT',
          message: 'Request timeout - server took too long to respond',
          code: 'TIMEOUT',
          details: error.message
        },
        success: false
      };
    }
    
    if (error.message.includes('fetch failed') || 
        error.message.includes('TypeError: fetch failed') ||
        error.message.includes('Network error') ||
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('ERR_NETWORK')) {
      return {
        data: null,
        error: {
          type: 'NETWORK',
          message: 'Network error - unable to connect to server',
          code: 'NETWORK_ERROR',
          details: error.message
        },
        success: false
      };
    }
    
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      return {
        data: null,
        error: {
          type: 'NETWORK',
          message: 'CORS error - cross-origin request blocked',
          code: 'CORS_ERROR',
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

// Retry mechanism with exponential backoff
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  context: string = 'unknown',
  maxRetries: number = 3
): Promise<FetchResult> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[${context}] Attempt ${attempt}/${maxRetries}`);
    
    const result = await safeFetch(url, options, context);
    
    if (result.success) {
      return result;
    }
    
    // Only retry network errors, not auth or server errors
    if (result.error?.type === 'NETWORK' || result.error?.type === 'TIMEOUT') {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`[${context}] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // Don't retry auth, server, or unknown errors
    return result;
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

// Utility function to check if fetch is available
export function isFetchAvailable(): boolean {
  return typeof fetch !== 'undefined' && typeof window !== 'undefined';
}

// Utility function to safely execute fetch operations
export async function safeFetchOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string = 'unknown'
): Promise<T> {
  try {
    if (!isFetchAvailable()) {
      console.log(`[${context}] Fetch not available, using fallback`);
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    console.error(`[${context}] Operation failed, using fallback:`, error);
    return fallback;
  }
} 