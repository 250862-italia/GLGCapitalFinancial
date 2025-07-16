// Rate Limiting System
// Prevents brute force attacks and API abuse

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

// In-memory storage (in production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'auth': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },
  'register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },
  'api': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  'admin': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 attempts per 5 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  }
};

export class RateLimiter {
  static getClientIdentifier(request: Request): string {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}-${userAgent}`;
  }

  static isRateLimited(
    identifier: string, 
    configType: keyof typeof DEFAULT_CONFIGS = 'api',
    success: boolean = false
  ): { limited: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const config = DEFAULT_CONFIGS[configType];
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      rateLimitStore.set(identifier, entry);
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        limited: true,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000)
      };
    }

    // Reset block if expired
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    // Skip rate limiting based on config
    if (success && config.skipSuccessfulRequests) {
      return {
        limited: false,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
      };
    }

    if (!success && config.skipFailedRequests) {
      return {
        limited: false,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
      };
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      // Block for the remaining window time
      entry.blocked = true;
      entry.blockUntil = entry.resetTime;
      
      return {
        limited: true,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    return {
      limited: false,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  static getRateLimitHeaders(
    identifier: string, 
    configType: keyof typeof DEFAULT_CONFIGS = 'api',
    success: boolean = false
  ): Record<string, string> {
    const result = this.isRateLimited(identifier, configType, success);
    const config = DEFAULT_CONFIGS[configType];
    
    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      ...(result.limited && result.retryAfter ? {
        'Retry-After': result.retryAfter.toString()
      } : {})
    };
  }

  // Cleanup old entries (run periodically)
  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime + (24 * 60 * 60 * 1000)) { // Keep for 24 hours after reset
        rateLimitStore.delete(key);
      }
    }
  }

  // Reset rate limit for a specific identifier
  static reset(identifier: string): void {
    rateLimitStore.delete(identifier);
  }

  // Get rate limit statistics
  static getStats(): { totalEntries: number; blockedEntries: number } {
    let blockedCount = 0;
    for (const entry of rateLimitStore.values()) {
      if (entry.blocked) blockedCount++;
    }
    
    return {
      totalEntries: rateLimitStore.size,
      blockedEntries: blockedCount
    };
  }
}

// Rate limiting middleware
export function withRateLimit(
  configType: keyof typeof DEFAULT_CONFIGS = 'api',
  handler: Function
) {
  return async (request: Request) => {
    const identifier = RateLimiter.getClientIdentifier(request);
    
    // Check rate limit before processing
    const rateLimitResult = RateLimiter.isRateLimited(identifier, configType);
    
    if (rateLimitResult.limited) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...RateLimiter.getRateLimitHeaders(identifier, configType, false)
          }
        }
      );
    }

    // Process the request
    const response = await handler(request);
    
    // Add rate limit headers to response
    const success = response.status < 400;
    const headers = new Headers(response.headers);
    Object.entries(RateLimiter.getRateLimitHeaders(identifier, configType, success))
      .forEach(([key, value]) => headers.set(key, value));
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}

// Run cleanup every hour
setInterval(() => {
  RateLimiter.cleanup();
}, 60 * 60 * 1000); 