import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SecurityEvent {
  eventType: string;
  eventDetails?: any;
  severity: 'info' | 'warning' | 'error';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logSecurityEvent(
  eventType: string,
  eventDetails?: any,
  severity: 'info' | 'warning' | 'error' = 'info',
  userId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    await supabase.from('audit_logs').insert({
      table_name: 'security_events',
      operation: eventType,
      new_data: eventDetails,
      user_id: userId,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    });

    console.log(`[SECURITY] ${severity.toUpperCase()}: ${eventType}`, eventDetails);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Predefined security event types
export const SecurityEvents = {
  // Authentication events
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // Registration events
  REGISTRATION_ATTEMPT: 'registration_attempt',
  REGISTRATION_SUCCESS: 'registration_success',
  REGISTRATION_FAILED: 'registration_failed',
  
  // MFA events
  MFA_SETUP: 'mfa_setup',
  MFA_VERIFICATION: 'mfa_verification',
  MFA_FAILED: 'mfa_failed',
  
  // Profile events
  PROFILE_UPDATE: 'profile_update',
  PROFILE_VIEW: 'profile_view',
  
  // Admin events
  ADMIN_ACTION: 'admin_action',
  USER_MANAGEMENT: 'user_management',
  
  // Suspicious activity
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token',
  CSRF_VIOLATION: 'csrf_violation',
  
  // Data access events
  DATA_ACCESS: 'data_access',
  DATA_MODIFICATION: 'data_modification',
  DATA_EXPORT: 'data_export',
  
  // System events
  SYSTEM_ERROR: 'system_error',
  CONFIGURATION_CHANGE: 'configuration_change'
} as const;

// Helper functions for common security events
export const SecurityMonitor = {
  // Authentication monitoring
  async logLoginAttempt(email: string, success: boolean, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      success ? SecurityEvents.LOGIN_SUCCESS : SecurityEvents.LOGIN_FAILED,
      { email, success, timestamp: new Date().toISOString() },
      success ? 'info' : 'warning',
      undefined,
      ipAddress,
      userAgent
    );
  },

  async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      SecurityEvents.PASSWORD_CHANGE,
      { userId, timestamp: new Date().toISOString() },
      'warning',
      userId,
      ipAddress,
      userAgent
    );
  },

  async logRegistrationAttempt(email: string, success: boolean, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      success ? SecurityEvents.REGISTRATION_SUCCESS : SecurityEvents.REGISTRATION_FAILED,
      { email, success, timestamp: new Date().toISOString() },
      success ? 'info' : 'warning',
      undefined,
      ipAddress,
      userAgent
    );
  },

  // MFA monitoring
  async logMFASetup(userId: string, method: string, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      SecurityEvents.MFA_SETUP,
      { userId, method, timestamp: new Date().toISOString() },
      'info',
      userId,
      ipAddress,
      userAgent
    );
  },

  async logMFAVerification(userId: string, success: boolean, method: string, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      success ? SecurityEvents.MFA_VERIFICATION : SecurityEvents.MFA_FAILED,
      { userId, method, success, timestamp: new Date().toISOString() },
      success ? 'info' : 'warning',
      userId,
      ipAddress,
      userAgent
    );
  },

  // Suspicious activity monitoring
  async logSuspiciousActivity(
    eventType: string,
    details: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await logSecurityEvent(
      SecurityEvents.SUSPICIOUS_ACTIVITY,
      { eventType, details, timestamp: new Date().toISOString() },
      'error',
      userId,
      ipAddress,
      userAgent
    );
  },

  async logCSRFViolation(ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      SecurityEvents.CSRF_VIOLATION,
      { timestamp: new Date().toISOString() },
      'error',
      undefined,
      ipAddress,
      userAgent
    );
  },

  async logRateLimitExceeded(endpoint: string, ipAddress?: string, userAgent?: string) {
    await logSecurityEvent(
      SecurityEvents.RATE_LIMIT_EXCEEDED,
      { endpoint, timestamp: new Date().toISOString() },
      'warning',
      undefined,
      ipAddress,
      userAgent
    );
  },

  // Admin action monitoring
  async logAdminAction(
    action: string,
    details: any,
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await logSecurityEvent(
      SecurityEvents.ADMIN_ACTION,
      { action, details, timestamp: new Date().toISOString() },
      'info',
      adminUserId,
      ipAddress,
      userAgent
    );
  },

  // Data access monitoring
  async logDataAccess(
    resource: string,
    action: 'read' | 'write' | 'delete',
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await logSecurityEvent(
      SecurityEvents.DATA_ACCESS,
      { resource, action, timestamp: new Date().toISOString() },
      'info',
      userId,
      ipAddress,
      userAgent
    );
  },

  // System monitoring
  async logSystemError(error: Error, context?: any) {
    await logSecurityEvent(
      SecurityEvents.SYSTEM_ERROR,
      { 
        error: error.message, 
        stack: error.stack, 
        context,
        timestamp: new Date().toISOString() 
      },
      'error'
    );
  }
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(windowMs: number = 60000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (attempt.count >= this.maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Export rate limiter instances for different use cases
export const loginRateLimiter = new RateLimiter(300000, 5); // 5 attempts per 5 minutes
export const registrationRateLimiter = new RateLimiter(600000, 3); // 3 attempts per 10 minutes
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute

// Utility to get client IP and user agent
export function getClientInfo(request: Request): { ipAddress?: string; userAgent?: string } {
  const userAgent = request.headers.get('user-agent') || undefined;
  
  // Try to get IP from various headers
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    undefined;

  return { ipAddress, userAgent };
} 