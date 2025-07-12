import { NextRequest } from 'next/server'

// Security Event Types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VIOLATION = 'csrf_violation',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  FILE_UPLOAD_ATTEMPT = 'file_upload_attempt',
  ADMIN_ACCESS = 'admin_access',
  DATA_EXPORT = 'data_export',
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_ERROR = 'system_error',
  NETWORK_ATTACK = 'network_attack',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  PHISHING_ATTEMPT = 'phishing_attempt',
  MALWARE_DETECTED = 'malware_detected',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_BREACH = 'data_breach',
  COMPLIANCE_VIOLATION = 'compliance_violation',
}

// Security Event Severity
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security Event Interface
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: SecuritySeverity
  timestamp: Date
  source: string
  ip: string
  userAgent: string
  userId?: string
  email?: string
  details: Record<string, any>
  sessionId?: string
  requestId?: string
  resolved: boolean
  falsePositive: boolean
  notes?: string
}

// Security Alert Interface
export interface SecurityAlert {
  id: string
  eventIds: string[]
  type: string
  severity: SecuritySeverity
  timestamp: Date
  description: string
  recommendations: string[]
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

// Security Monitoring Configuration
const SECURITY_CONFIG = {
  ALERT_THRESHOLDS: {
    LOGIN_FAILURES: 5,
    RATE_LIMIT_VIOLATIONS: 10,
    SUSPICIOUS_ACTIVITIES: 3,
    ADMIN_ACCESS_ATTEMPTS: 2,
    FILE_UPLOAD_ATTEMPTS: 5,
  },
  ALERT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RETENTION_DAYS: 90,
  AUTO_RESOLVE_HOURS: 24,
  NOTIFICATION_EMAILS: [
    'security@glgcapitalgroupllc.com',
    'admin@glgcapitalgroupllc.com',
    'push@glgcapitalgroupllc.com'
  ],
}

// In-memory storage (in production, use database)
const securityEvents: SecurityEvent[] = []
const securityAlerts: SecurityAlert[] = []
const eventCounters = new Map<string, { count: number; firstSeen: Date }>()

// Security Monitoring Service
export class SecurityMonitor {
  static async logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    request: NextRequest,
    details: Record<string, any> = {},
    userId?: string,
    email?: string
  ): Promise<void> {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: new Date(),
      source: request.nextUrl.pathname,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      userId,
      email,
      details,
      sessionId: request.headers.get('x-session-id') || undefined,
      requestId: request.headers.get('x-request-id') || undefined,
      resolved: false,
      falsePositive: false,
    }

    // Store event
    securityEvents.push(event)

    // Update counters
    const key = `${type}_${event.ip}`
    const counter = eventCounters.get(key) || { count: 0, firstSeen: new Date() }
    counter.count++
    eventCounters.set(key, counter)

    // Check for alerts
    await this.checkForAlerts(event)

    // Send immediate notification for critical events
    if (severity === SecuritySeverity.CRITICAL) {
      await this.sendImmediateAlert(event)
    }

    // Cleanup old events
    this.cleanupOldEvents()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${event.timestamp.toISOString()} - ${type} - ${severity} - ${event.ip}`)
    }
  }

  static async checkForAlerts(event: SecurityEvent): Promise<void> {
    const key = `${event.type}_${event.ip}`
    const counter = eventCounters.get(key)
    
    if (!counter) return

    const threshold = SECURITY_CONFIG.ALERT_THRESHOLDS[event.type as unknown as keyof typeof SECURITY_CONFIG.ALERT_THRESHOLDS] || 5
    const timeWindow = Date.now() - SECURITY_CONFIG.ALERT_WINDOW_MS

    // Check if we should create an alert
    if (counter.count >= threshold && counter.firstSeen.getTime() > timeWindow) {
      const existingAlert = securityAlerts.find(alert => 
        alert.type === `${event.type}_threshold_exceeded` && 
        alert.status === 'open'
      )

      if (!existingAlert) {
        const alert: SecurityAlert = {
          id: crypto.randomUUID(),
          eventIds: [event.id],
          type: `${event.type}_threshold_exceeded`,
          severity: this.calculateAlertSeverity(event.type, counter.count),
          timestamp: new Date(),
          description: `${event.type} threshold exceeded (${counter.count}/${threshold}) from IP ${event.ip}`,
          recommendations: this.generateRecommendations(event.type),
          status: 'open',
          priority: this.calculatePriority(event.type, counter.count),
          notes: undefined,
        }

        securityAlerts.push(alert)
        await this.sendAlertNotification(alert)
      } else {
        // Update existing alert
        existingAlert.eventIds.push(event.id)
        existingAlert.description = `${event.type} threshold exceeded (${counter.count}/${threshold}) from IP ${event.ip}`
        existingAlert.priority = this.calculatePriority(event.type, counter.count)
      }
    }
  }

  static calculateAlertSeverity(eventType: SecurityEventType, count: number): SecuritySeverity {
    switch (eventType) {
      case SecurityEventType.LOGIN_FAILURE:
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
        return count > 20 ? SecuritySeverity.CRITICAL : SecuritySeverity.HIGH
      case SecurityEventType.ADMIN_ACCESS:
      case SecurityEventType.PRIVILEGE_ESCALATION:
        return SecuritySeverity.CRITICAL
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
        return SecuritySeverity.HIGH
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return count > 50 ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM
      default:
        return SecuritySeverity.MEDIUM
    }
  }

  static calculatePriority(eventType: SecurityEventType, count: number): 'low' | 'medium' | 'high' | 'urgent' {
    switch (eventType) {
      case SecurityEventType.LOGIN_FAILURE:
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
        return count > 20 ? 'urgent' : 'high'
      case SecurityEventType.ADMIN_ACCESS:
      case SecurityEventType.PRIVILEGE_ESCALATION:
        return 'urgent'
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
        return 'high'
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return count > 50 ? 'high' : 'medium'
      default:
        return 'medium'
    }
  }

  static generateRecommendations(eventType: SecurityEventType): string[] {
    switch (eventType) {
      case SecurityEventType.LOGIN_FAILURE:
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
        return [
          'Block IP address temporarily',
          'Enable two-factor authentication',
          'Review account security settings',
          'Monitor for additional attempts'
        ]
      case SecurityEventType.ADMIN_ACCESS:
        return [
          'Verify admin credentials',
          'Review access logs',
          'Enable additional authentication',
          'Monitor admin activities'
        ]
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
        return [
          'Block IP address',
          'Review application logs',
          'Update security rules',
          'Scan for vulnerabilities'
        ]
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return [
          'Implement stricter rate limiting',
          'Review API usage patterns',
          'Consider IP whitelisting',
          'Monitor for DDoS attacks'
        ]
      default:
        return [
          'Investigate the incident',
          'Review security logs',
          'Update security policies if needed'
        ]
    }
  }

  static async sendImmediateAlert(event: SecurityEvent): Promise<void> {
    const subject = `🚨 CRITICAL SECURITY ALERT: ${event.type}`
    const body = `
      Critical security event detected:
      
      Type: ${event.type}
      Severity: ${event.severity}
      Timestamp: ${event.timestamp.toISOString()}
      IP: ${event.ip}
      Source: ${event.source}
      User Agent: ${event.userAgent}
      Details: ${JSON.stringify(event.details, null, 2)}
      
      Immediate action required!
    `

    // Email notification disabled - service not available
    console.log('Security alert would be sent:', subject)
  }

  static async sendAlertNotification(alert: SecurityAlert): Promise<void> {
    const subject = `⚠️ Security Alert: ${alert.type}`
    const body = `
      Security alert triggered:
      
      Type: ${alert.type}
      Severity: ${alert.severity}
      Priority: ${alert.priority}
      Timestamp: ${alert.timestamp.toISOString()}
      Description: ${alert.description}
      
      Recommendations:
      ${alert.recommendations.map(rec => `- ${rec}`).join('\n')}
      
      Please investigate and take appropriate action.
    `

    // Email notification disabled - service not available
    console.log('Security alert would be sent:', subject)
  }

  static cleanupOldEvents(): void {
    const cutoffDate = new Date(Date.now() - (SECURITY_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000))
    
    // Remove old events
    const oldEventCount = securityEvents.length
    const filteredEvents = securityEvents.filter(event => event.timestamp > cutoffDate)
    securityEvents.length = 0
    securityEvents.push(...filteredEvents)

    // Remove old alerts
    const filteredAlerts = securityAlerts.filter(alert => alert.timestamp > cutoffDate)
    securityAlerts.length = 0
    securityAlerts.push(...filteredAlerts)

    // Clean up counters
    for (const [key, counter] of eventCounters.entries()) {
      if (counter.firstSeen < cutoffDate) {
        eventCounters.delete(key)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] Cleaned up ${oldEventCount - securityEvents.length} old events`)
    }
  }

  static getEvents(filters?: {
    type?: SecurityEventType
    severity?: SecuritySeverity
    ip?: string
    userId?: string
    startDate?: Date
    endDate?: Date
  }): SecurityEvent[] {
    return securityEvents.filter(event => {
      if (filters?.type && event.type !== filters.type) return false
      if (filters?.severity && event.severity !== filters.severity) return false
      if (filters?.ip && event.ip !== filters.ip) return false
      if (filters?.userId && event.userId !== filters.userId) return false
      if (filters?.startDate && event.timestamp < filters.startDate) return false
      if (filters?.endDate && event.timestamp > filters.endDate) return false
      return true
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static getAlerts(filters?: {
    status?: 'open' | 'investigating' | 'resolved' | 'false_positive'
    severity?: SecuritySeverity
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  }): SecurityAlert[] {
    return securityAlerts.filter(alert => {
      if (filters?.status && alert.status !== filters.status) return false
      if (filters?.severity && alert.severity !== filters.severity) return false
      if (filters?.priority && alert.priority !== filters.priority) return false
      return true
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static getSecurityStats(): {
    totalEvents: number
    totalAlerts: number
    openAlerts: number
    criticalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
  } {
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}
    let criticalEvents = 0

    securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
      if (event.severity === SecuritySeverity.CRITICAL) criticalEvents++
    })

    return {
      totalEvents: securityEvents.length,
      totalAlerts: securityAlerts.length,
      openAlerts: securityAlerts.filter(alert => alert.status === 'open').length,
      criticalEvents,
      eventsByType,
      eventsBySeverity,
    }
  }

  static async resolveAlert(alertId: string, notes?: string): Promise<void> {
    const alert = securityAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.notes = notes
      
      // Mark related events as resolved
      alert.eventIds.forEach(eventId => {
        const event = securityEvents.find(e => e.id === eventId)
        if (event) event.resolved = true
      })
    }
  }

  static async markAlertAsFalsePositive(alertId: string, notes?: string): Promise<void> {
    const alert = securityAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'false_positive'
      alert.notes = notes
      
      // Mark related events as false positive
      alert.eventIds.forEach(eventId => {
        const event = securityEvents.find(e => e.id === eventId)
        if (event) event.falsePositive = true
      })
    }
  }
}

// Security Event Helpers
export const SecurityEvents = {
  loginAttempt: (request: NextRequest, success: boolean, userId?: string, email?: string) =>
    SecurityMonitor.logEvent(
      success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      success ? SecuritySeverity.LOW : SecuritySeverity.MEDIUM,
      request,
      { success },
      userId,
      email
    ),

  suspiciousActivity: (request: NextRequest, details: Record<string, any>, userId?: string) =>
    SecurityMonitor.logEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecuritySeverity.HIGH,
      request,
      details,
      userId
    ),

  adminAccess: (request: NextRequest, userId: string, email: string) =>
    SecurityMonitor.logEvent(
      SecurityEventType.ADMIN_ACCESS,
      SecuritySeverity.HIGH,
      request,
      { adminAccess: true },
      userId,
      email
    ),

  rateLimitExceeded: (request: NextRequest, limit: number, current: number) =>
    SecurityMonitor.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecuritySeverity.MEDIUM,
      request,
      { limit, current }
    ),

  csrfViolation: (request: NextRequest) =>
    SecurityMonitor.logEvent(
      SecurityEventType.CSRF_VIOLATION,
      SecuritySeverity.HIGH,
      request,
      { csrfViolation: true }
    ),
}

// Export default security monitor
export default SecurityMonitor 