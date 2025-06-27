interface RateLimitRule {
  key: string;
  limit: number; // Number of requests allowed
  window: number; // Time window in milliseconds
  description: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds to wait before retry
}

interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: Date;
  lastRequest: Date;
}

class RateLimiter {
  private rules: Map<string, RateLimitRule> = new Map();
  private entries: Map<string, RateLimitEntry> = new Map();
  private blockedIPs: Set<string> = new Set();
  private whitelistedIPs: Set<string> = new Set();

  constructor() {
    // Initialize default rules
    this.addRule({
      key: 'global',
      limit: 1000,
      window: 60 * 1000, // 1 minute
      description: 'Global rate limit'
    });

    this.addRule({
      key: 'auth',
      limit: 5,
      window: 15 * 60 * 1000, // 15 minutes
      description: 'Authentication attempts'
    });

    this.addRule({
      key: 'api',
      limit: 100,
      window: 60 * 1000, // 1 minute
      description: 'API requests'
    });

    this.addRule({
      key: 'investment',
      limit: 10,
      window: 60 * 1000, // 1 minute
      description: 'Investment operations'
    });

    // Start cleanup interval
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Add a rate limit rule
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.key, rule);
    console.log(`📋 Rate limit rule added: ${rule.description}`);
  }

  // Check if request is allowed
  checkLimit(
    key: string,
    identifier: string, // Usually IP address or user ID
    ruleKey: string = 'global'
  ): RateLimitResult {
    // Check if IP is blocked
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        retryAfter: 24 * 60 * 60 // 24 hours in seconds
      };
    }

    // Check if IP is whitelisted
    if (this.whitelistedIPs.has(identifier)) {
      return {
        allowed: true,
        remaining: 999999,
        resetTime: new Date(Date.now() + 60 * 1000)
      };
    }

    const rule = this.rules.get(ruleKey);
    if (!rule) {
      console.warn(`⚠️ Rate limit rule not found: ${ruleKey}`);
      return {
        allowed: true,
        remaining: 999999,
        resetTime: new Date(Date.now() + 60 * 1000)
      };
    }

    const entryKey = `${ruleKey}:${identifier}`;
    const now = new Date();
    let entry = this.entries.get(entryKey);

    // Create new entry if doesn't exist or window has expired
    if (!entry || now.getTime() - entry.windowStart.getTime() > rule.window) {
      entry = {
        key: entryKey,
        count: 0,
        windowStart: now,
        lastRequest: now
      };
    }

    // Check if limit exceeded
    if (entry.count >= rule.limit) {
      const resetTime = new Date(entry.windowStart.getTime() + rule.window);
      const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);

      // Log rate limit violation
      console.warn(`🚫 Rate limit exceeded: ${ruleKey} for ${identifier} (${rule.description})`);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter
      };
    }

    // Update entry
    entry.count++;
    entry.lastRequest = now;
    this.entries.set(entryKey, entry);

    const remaining = rule.limit - entry.count;
    const resetTime = new Date(entry.windowStart.getTime() + rule.window);

    return {
      allowed: true,
      remaining,
      resetTime
    };
  }

  // Check multiple rate limits
  checkMultipleLimits(
    identifier: string,
    checks: Array<{ key: string; ruleKey?: string }>
  ): { allowed: boolean; results: Record<string, RateLimitResult> } {
    const results: Record<string, RateLimitResult> = {};
    let allAllowed = true;

    for (const check of checks) {
      const result = this.checkLimit(check.key, identifier, check.ruleKey);
      results[check.key] = result;
      
      if (!result.allowed) {
        allAllowed = false;
      }
    }

    return {
      allowed: allAllowed,
      results
    };
  }

  // Block an IP address
  blockIP(ip: string, reason: string = 'Rate limit violation'): void {
    this.blockedIPs.add(ip);
    console.warn(`🚫 IP blocked: ${ip} - ${reason}`);
  }

  // Unblock an IP address
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    console.log(`✅ IP unblocked: ${ip}`);
  }

  // Whitelist an IP address
  whitelistIP(ip: string): void {
    this.whitelistedIPs.add(ip);
    console.log(`✅ IP whitelisted: ${ip}`);
  }

  // Remove IP from whitelist
  removeFromWhitelist(ip: string): void {
    this.whitelistedIPs.delete(ip);
    console.log(`❌ IP removed from whitelist: ${ip}`);
  }

  // Get rate limit statistics
  getStats(): {
    totalRules: number;
    totalEntries: number;
    blockedIPs: number;
    whitelistedIPs: number;
    activeEntries: number;
  } {
    const now = Date.now();
    const activeEntries = Array.from(this.entries.values()).filter(entry => {
      const rule = this.rules.get(entry.key.split(':')[0]);
      return rule && (now - entry.windowStart.getTime()) <= rule.window;
    }).length;

    return {
      totalRules: this.rules.size,
      totalEntries: this.entries.size,
      blockedIPs: this.blockedIPs.size,
      whitelistedIPs: this.whitelistedIPs.size,
      activeEntries
    };
  }

  // Get blocked IPs
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // Get whitelisted IPs
  getWhitelistedIPs(): string[] {
    return Array.from(this.whitelistedIPs);
  }

  // Clear all entries for a specific identifier
  clearEntries(identifier: string): void {
    const keysToDelete: string[] = [];
    
    this.entries.forEach((entry, key) => {
      if (key.includes(identifier)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.entries.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} entries for ${identifier}`);
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.entries.forEach((entry, key) => {
      const ruleKey = key.split(':')[0];
      const rule = this.rules.get(ruleKey);
      
      if (rule && (now - entry.windowStart.getTime()) > rule.window) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.entries.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }
}

// Specialized rate limiters for different use cases
class AuthRateLimiter extends RateLimiter {
  constructor() {
    super();
    
    // Override auth rule with stricter limits
    this.addRule({
      key: 'login',
      limit: 3,
      window: 15 * 60 * 1000, // 15 minutes
      description: 'Login attempts'
    });

    this.addRule({
      key: 'register',
      limit: 2,
      window: 60 * 60 * 1000, // 1 hour
      description: 'Registration attempts'
    });

    this.addRule({
      key: 'password_reset',
      limit: 3,
      window: 60 * 60 * 1000, // 1 hour
      description: 'Password reset attempts'
    });
  }

  // Check login rate limit
  checkLoginLimit(ip: string): RateLimitResult {
    return this.checkLimit('login', ip, 'login');
  }

  // Check registration rate limit
  checkRegisterLimit(ip: string): RateLimitResult {
    return this.checkLimit('register', ip, 'register');
  }

  // Check password reset rate limit
  checkPasswordResetLimit(ip: string): RateLimitResult {
    return this.checkLimit('password_reset', ip, 'password_reset');
  }
}

class APIRateLimiter extends RateLimiter {
  constructor() {
    super();
    
    // Add API-specific rules
    this.addRule({
      key: 'api_read',
      limit: 200,
      window: 60 * 1000, // 1 minute
      description: 'API read requests'
    });

    this.addRule({
      key: 'api_write',
      limit: 50,
      window: 60 * 1000, // 1 minute
      description: 'API write requests'
    });

    this.addRule({
      key: 'api_admin',
      limit: 20,
      window: 60 * 1000, // 1 minute
      description: 'API admin requests'
    });
  }

  // Check API rate limit based on method
  checkAPILimit(ip: string, method: string, isAdmin: boolean = false): RateLimitResult {
    if (isAdmin) {
      return this.checkLimit('api_admin', ip, 'api_admin');
    }

    if (method === 'GET') {
      return this.checkLimit('api_read', ip, 'api_read');
    } else {
      return this.checkLimit('api_write', ip, 'api_write');
    }
  }
}

class InvestmentRateLimiter extends RateLimiter {
  constructor() {
    super();
    
    // Add investment-specific rules
    this.addRule({
      key: 'investment_create',
      limit: 5,
      window: 60 * 1000, // 1 minute
      description: 'Investment creation'
    });

    this.addRule({
      key: 'investment_modify',
      limit: 10,
      window: 60 * 1000, // 1 minute
      description: 'Investment modifications'
    });

    this.addRule({
      key: 'large_investment',
      limit: 1,
      window: 5 * 60 * 1000, // 5 minutes
      description: 'Large investment transactions'
    });
  }

  // Check investment rate limit
  checkInvestmentLimit(userId: string, amount: number): RateLimitResult {
    if (amount > 100000) {
      return this.checkLimit('large_investment', userId, 'large_investment');
    }
    return this.checkLimit('investment_create', userId, 'investment_create');
  }
}

// Export instances
export const authRateLimiter = new AuthRateLimiter();
export const apiRateLimiter = new APIRateLimiter();
export const investmentRateLimiter = new InvestmentRateLimiter();
export const generalRateLimiter = new RateLimiter();

// Export types and class
export type { RateLimitRule, RateLimitResult, RateLimitEntry };
export { RateLimiter }; 