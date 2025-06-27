interface APIRequest {
  id: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: Date;
  userId?: string;
}

interface APIResponse {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  timestamp: Date;
  duration: number;
}

interface APIError {
  id: string;
  requestId: string;
  message: string;
  status?: number;
  timestamp: Date;
  retryable: boolean;
  retryCount: number;
}

interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
}

class APIManager {
  private config: APIConfig;
  private requests: Map<string, APIRequest> = new Map();
  private responses: Map<string, APIResponse> = new Map();
  private errors: APIError[] = [];
  private interceptors: {
    request: Array<(request: APIRequest) => APIRequest | Promise<APIRequest>>;
    response: Array<(response: APIResponse) => APIResponse | Promise<APIResponse>>;
    error: Array<(error: APIError) => APIError | Promise<APIError>>;
  } = {
    request: [],
    response: [],
    error: []
  };

  constructor(config: Partial<APIConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };
  }

  // Make API request
  async request<T = any>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>,
    userId?: string
  ): Promise<T> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;

    const request: APIRequest = {
      id: requestId,
      method: method.toUpperCase(),
      url: fullUrl,
      headers: { ...this.config.headers, ...headers },
      body: data,
      timestamp: new Date(),
      userId
    };

    // Apply request interceptors
    let processedRequest = request;
    for (const interceptor of this.interceptors.request) {
      processedRequest = await interceptor(processedRequest);
    }

    this.requests.set(requestId, processedRequest);

    let lastError: APIError | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest(processedRequest);
        
        // Apply response interceptors
        let processedResponse = response;
        for (const interceptor of this.interceptors.response) {
          processedResponse = await interceptor(processedResponse);
        }

        this.responses.set(requestId, processedResponse);
        return processedResponse.data;

      } catch (error: any) {
        const apiError: APIError = {
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          requestId,
          message: error.message || 'Unknown error',
          status: error.status,
          timestamp: new Date(),
          retryable: this.isRetryableError(error),
          retryCount: attempt
        };

        lastError = apiError;

        // Apply error interceptors
        for (const interceptor of this.interceptors.error) {
          await interceptor(apiError);
        }

        this.errors.push(apiError);

        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === this.config.retryAttempts || !apiError.retryable) {
          throw new Error(`API request failed after ${attempt + 1} attempts: ${error.message}`);
        }

        // Wait before retry
        await this.delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw new Error(`API request failed: ${lastError?.message}`);
  }

  // Make actual HTTP request
  private async makeRequest(request: APIRequest): Promise<APIResponse> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const duration = Date.now() - startTime;

      const apiResponse: APIResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
        timestamp: new Date(),
        duration
      };

      // Handle non-2xx responses
      if (!response.ok) {
        throw {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data
        };
      }

      return apiResponse;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw { message: 'Request timeout', status: 408 };
      }
      
      throw error;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    const status = error.status;
    
    // Retry on 5xx server errors and network errors
    if (status >= 500 && status < 600) {
      return true;
    }
    
    // Retry on specific 4xx errors
    if (status === 408 || status === 429) {
      return true;
    }
    
    // Retry on network errors (no status)
    if (!status) {
      return true;
    }
    
    return false;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get<T = any>(url: string, headers?: Record<string, string>, userId?: string): Promise<T> {
    return this.request<T>('GET', url, undefined, headers, userId);
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>, userId?: string): Promise<T> {
    return this.request<T>('POST', url, data, headers, userId);
  }

  async put<T = any>(url: string, data?: any, headers?: Record<string, string>, userId?: string): Promise<T> {
    return this.request<T>('PUT', url, data, headers, userId);
  }

  async patch<T = any>(url: string, data?: any, headers?: Record<string, string>, userId?: string): Promise<T> {
    return this.request<T>('PATCH', url, data, headers, userId);
  }

  async delete<T = any>(url: string, headers?: Record<string, string>, userId?: string): Promise<T> {
    return this.request<T>('DELETE', url, undefined, headers, userId);
  }

  // Add interceptors
  addRequestInterceptor(interceptor: (request: APIRequest) => APIRequest | Promise<APIRequest>): void {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: APIResponse) => APIResponse | Promise<APIResponse>): void {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: APIError) => APIError | Promise<APIError>): void {
    this.interceptors.error.push(interceptor);
  }

  // Authentication interceptor
  addAuthInterceptor(token: string): void {
    this.addRequestInterceptor((request) => {
      request.headers = {
        ...request.headers,
        'Authorization': `Bearer ${token}`
      };
      return request;
    });
  }

  // Logging interceptor
  addLoggingInterceptor(): void {
    this.addRequestInterceptor((request) => {
      console.log(`📤 API Request: ${request.method} ${request.url}`);
      return request;
    });

    this.addResponseInterceptor((response) => {
      console.log(`📥 API Response: ${response.status} ${response.requestId} (${response.duration}ms)`);
      return response;
    });

    this.addErrorInterceptor((error) => {
      console.error(`❌ API Error: ${error.message} (attempt ${error.retryCount + 1})`);
      return error;
    });
  }

  // Get API statistics
  getAPIStats(): {
    totalRequests: number;
    totalResponses: number;
    totalErrors: number;
    averageResponseTime: number;
    successRate: number;
    errorsByStatus: Record<number, number>;
  } {
    const totalRequests = this.requests.size;
    const totalResponses = this.responses.size;
    const totalErrors = this.errors.length;

    const responseTimes = Array.from(this.responses.values()).map(r => r.duration);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const successRate = totalRequests > 0 ? (totalResponses / totalRequests) * 100 : 0;

    const errorsByStatus: Record<number, number> = {};
    this.errors.forEach(error => {
      if (error.status) {
        errorsByStatus[error.status] = (errorsByStatus[error.status] || 0) + 1;
      }
    });

    return {
      totalRequests,
      totalResponses,
      totalErrors,
      averageResponseTime,
      successRate,
      errorsByStatus
    };
  }

  // Get recent requests
  getRecentRequests(limit: number = 50): APIRequest[] {
    return Array.from(this.requests.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get recent errors
  getRecentErrors(limit: number = 50): APIError[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Clear old data
  clearOldData(daysToKeep: number = 7): void {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    
    // Clear old requests
    for (const [id, request] of this.requests.entries()) {
      if (request.timestamp.getTime() < cutoffTime) {
        this.requests.delete(id);
      }
    }

    // Clear old responses
    for (const [id, response] of this.responses.entries()) {
      if (response.timestamp.getTime() < cutoffTime) {
        this.responses.delete(id);
      }
    }

    // Clear old errors
    this.errors = this.errors.filter(error => error.timestamp.getTime() > cutoffTime);

    console.log(`🧹 Cleared old API data (older than ${daysToKeep} days)`);
  }

  // Update configuration
  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ API configuration updated');
  }

  // Get configuration
  getConfig(): APIConfig {
    return { ...this.config };
  }
}

// Create default API manager instance
export const apiManager = new APIManager({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});

// Add default interceptors
apiManager.addLoggingInterceptor();

// Export types and class
export type { APIRequest, APIResponse, APIError, APIConfig };
export { APIManager }; 