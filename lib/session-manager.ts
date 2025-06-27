interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface SessionActivity {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  sessionsByUser: Record<string, number>;
  averageSessionDuration: number;
  recentActivity: SessionActivity[];
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private activities: SessionActivity[] = [];
  private sessionTimeout: number = 24 * 60 * 60 * 1000; // 24 hours
  private maxSessionsPerUser: number = 5;
  private maxActivities: number = 10000;

  constructor() {
    this.initializeCleanup();
  }

  // Create a new session
  createSession(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>
  ): Session {
    // Check if user has too many active sessions
    const userSessions = this.getUserSessions(userId);
    if (userSessions.length >= this.maxSessionsPerUser) {
      // Remove oldest session
      const oldestSession = userSessions.sort((a, b) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      )[0];
      this.removeSession(oldestSession.id);
    }

    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      token,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeout),
      isActive: true,
      metadata
    };

    this.sessions.set(session.id, session);
    this.logActivity(session.id, userId, 'session_created', ipAddress, userAgent, metadata);

    console.log(`✅ Session created for user ${userId} from ${ipAddress}`);
    return session;
  }

  // Get session by token
  getSession(token: string): Session | null {
    for (const session of this.sessions.values()) {
      if (session.token === token && session.isActive && !this.isSessionExpired(session)) {
        return session;
      }
    }
    return null;
  }

  // Get session by ID
  getSessionById(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (session && session.isActive && !this.isSessionExpired(session)) {
      return session;
    }
    return null;
  }

  // Update session activity
  updateSessionActivity(sessionId: string, ipAddress: string, userAgent: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive || this.isSessionExpired(session)) {
      return false;
    }

    session.lastActivity = new Date();
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    session.expiresAt = new Date(Date.now() + this.sessionTimeout);

    this.sessions.set(sessionId, session);
    this.logActivity(sessionId, session.userId, 'session_activity', ipAddress, userAgent);

    return true;
  }

  // Remove session
  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = false;
    this.sessions.set(sessionId, session);
    this.logActivity(sessionId, session.userId, 'session_ended', session.ipAddress, session.userAgent);

    console.log(`🔚 Session ended for user ${session.userId}`);
    return true;
  }

  // Remove all sessions for a user
  removeUserSessions(userId: string): number {
    let removedCount = 0;
    
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.isActive) {
        session.isActive = false;
        this.sessions.set(session.id, session);
        this.logActivity(session.id, userId, 'session_ended', session.ipAddress, session.userAgent);
        removedCount++;
      }
    }

    console.log(`🔚 Removed ${removedCount} sessions for user ${userId}`);
    return removedCount;
  }

  // Get all sessions for a user
  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive && !this.isSessionExpired(session));
  }

  // Get active sessions
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.isActive && !this.isSessionExpired(session));
  }

  // Get session statistics
  getSessionStats(): SessionStats {
    const now = Date.now();
    const activeSessions = this.getActiveSessions();
    const expiredSessions = Array.from(this.sessions.values())
      .filter(session => !session.isActive || this.isSessionExpired(session));

    const sessionsByUser: Record<string, number> = {};
    let totalDuration = 0;

    activeSessions.forEach(session => {
      sessionsByUser[session.userId] = (sessionsByUser[session.userId] || 0) + 1;
      totalDuration += session.lastActivity.getTime() - session.createdAt.getTime();
    });

    const recentActivity = this.activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      sessionsByUser,
      averageSessionDuration: activeSessions.length > 0 ? totalDuration / activeSessions.length : 0,
      recentActivity
    };
  }

  // Get suspicious sessions
  getSuspiciousSessions(): Session[] {
    const suspiciousSessions: Session[] = [];
    const userSessions = new Map<string, Session[]>();

    // Group sessions by user
    this.getActiveSessions().forEach(session => {
      if (!userSessions.has(session.userId)) {
        userSessions.set(session.userId, []);
      }
      userSessions.get(session.userId)!.push(session);
    });

    // Check for suspicious patterns
    userSessions.forEach((sessions, userId) => {
      // Multiple sessions from different IPs
      const uniqueIPs = new Set(sessions.map(s => s.ipAddress));
      if (uniqueIPs.size > 3) {
        suspiciousSessions.push(...sessions);
      }

      // Sessions with very different user agents
      const uniqueUserAgents = new Set(sessions.map(s => s.userAgent));
      if (uniqueUserAgents.size > 2) {
        suspiciousSessions.push(...sessions);
      }

      // Sessions created very close together
      const sortedSessions = sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      for (let i = 1; i < sortedSessions.length; i++) {
        const timeDiff = sortedSessions[i].createdAt.getTime() - sortedSessions[i-1].createdAt.getTime();
        if (timeDiff < 60000) { // Less than 1 minute apart
          suspiciousSessions.push(sortedSessions[i]);
        }
      }
    });

    return suspiciousSessions;
  }

  // Log session activity
  private logActivity(
    sessionId: string,
    userId: string,
    action: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>
  ): void {
    const activity: SessionActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      action,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      metadata
    };

    this.activities.push(activity);

    // Keep only the last maxActivities entries
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }
  }

  // Check if session is expired
  private isSessionExpired(session: Session): boolean {
    return session.expiresAt.getTime() < Date.now();
  }

  // Initialize cleanup interval
  private initializeCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Cleanup every minute
  }

  // Cleanup expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.isActive && this.isSessionExpired(session)) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
        this.logActivity(sessionId, session.userId, 'session_expired', session.ipAddress, session.userAgent);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Set session timeout
  setSessionTimeout(timeout: number): void {
    this.sessionTimeout = timeout;
    console.log(`⚙️ Session timeout updated: ${timeout}ms`);
  }

  // Set max sessions per user
  setMaxSessionsPerUser(max: number): void {
    this.maxSessionsPerUser = max;
    console.log(`⚙️ Max sessions per user updated: ${max}`);
  }

  // Get session activity for a user
  getUserActivity(userId: string, limit: number = 100): SessionActivity[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get session activity for a session
  getSessionActivity(sessionId: string): SessionActivity[] {
    return this.activities
      .filter(activity => activity.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Force logout user from all devices
  forceLogoutUser(userId: string, reason: string = 'Admin action'): number {
    const removedCount = this.removeUserSessions(userId);
    
    this.logActivity('system', userId, 'force_logout', 'system', 'system', {
      reason,
      sessionsRemoved: removedCount
    });

    console.log(`🔒 Force logged out user ${userId} from ${removedCount} sessions (${reason})`);
    return removedCount;
  }

  // Get sessions by IP address
  getSessionsByIP(ipAddress: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.ipAddress === ipAddress && session.isActive && !this.isSessionExpired(session));
  }

  // Block IP address (remove all sessions from that IP)
  blockIP(ipAddress: string, reason: string = 'Suspicious activity'): number {
    let blockedCount = 0;
    
    for (const session of this.sessions.values()) {
      if (session.ipAddress === ipAddress && session.isActive) {
        session.isActive = false;
        this.sessions.set(session.id, session);
        this.logActivity(session.id, session.userId, 'session_blocked', ipAddress, session.userAgent, {
          reason,
          blockedIP: ipAddress
        });
        blockedCount++;
      }
    }

    console.log(`🚫 Blocked ${blockedCount} sessions from IP ${ipAddress} (${reason})`);
    return blockedCount;
  }

  // Get session analytics
  getSessionAnalytics(timeRange: number = 24 * 60 * 60 * 1000): {
    totalSessions: number;
    uniqueUsers: number;
    averageSessionsPerUser: number;
    mostActiveUsers: Array<{ userId: string; sessions: number; lastActivity: Date }>;
    sessionsByHour: Record<number, number>;
  } {
    const cutoffTime = Date.now() - timeRange;
    const recentSessions = Array.from(this.sessions.values())
      .filter(session => session.createdAt.getTime() > cutoffTime);

    const uniqueUsers = new Set(recentSessions.map(s => s.userId)).size;
    const userSessionCounts = new Map<string, { sessions: number; lastActivity: Date }>();

    recentSessions.forEach(session => {
      const existing = userSessionCounts.get(session.userId) || { sessions: 0, lastActivity: session.lastActivity };
      existing.sessions++;
      if (session.lastActivity > existing.lastActivity) {
        existing.lastActivity = session.lastActivity;
      }
      userSessionCounts.set(session.userId, existing);
    });

    const mostActiveUsers = Array.from(userSessionCounts.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const sessionsByHour: Record<number, number> = {};
    recentSessions.forEach(session => {
      const hour = session.createdAt.getHours();
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
    });

    return {
      totalSessions: recentSessions.length,
      uniqueUsers,
      averageSessionsPerUser: recentSessions.length / uniqueUsers,
      mostActiveUsers,
      sessionsByHour
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export types
export type { Session, SessionActivity, SessionStats }; 