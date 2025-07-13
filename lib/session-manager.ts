interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  is_active: boolean;
  createdAt: string;
  expiresAt: string;
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

  createSession(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>
  ): Session {
    // Remove old sessions for this user if limit exceeded
    const userSessions = this.getUserSessions(userId);
    if (userSessions.length >= this.maxSessionsPerUser) {
      const oldestSession = userSessions[userSessions.length - 1];
      this.removeSession(oldestSession.id);
    }

    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      token,
      ipAddress,
      userAgent,
      is_active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString()
    };

    this.sessions.set(session.id, session);
    this.logActivity(session.id, userId, 'session_created', ipAddress, userAgent, metadata);

    console.log(`✅ Session created for user ${userId} from ${ipAddress}`);
    return session;
  }

  // Get session by token
  getSession(token: string): Session | null {
    for (const session of this.sessions.values()) {
      if (session.token === token && session.is_active && !this.isSessionExpired(session)) {
        return session;
      }
    }
    return null;
  }

  // Get session by ID
  getSessionById(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (session && session.is_active && !this.isSessionExpired(session)) {
      return session;
    }
    return null;
  }

  // Update session activity
  updateSessionActivity(sessionId: string, ipAddress: string, userAgent: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.is_active || this.isSessionExpired(session)) {
      return false;
    }

    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    session.expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();

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

    session.is_active = false;
    this.sessions.set(sessionId, session);
    this.logActivity(sessionId, session.userId, 'session_ended', session.ipAddress, session.userAgent);

    console.log(`🔚 Session ended for user ${session.userId}`);
    return true;
  }

  // Remove all sessions for a user
  removeUserSessions(userId: string): number {
    let removedCount = 0;
    
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.is_active) {
        session.is_active = false;
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
      .filter(session => session.userId === userId && session.is_active && !this.isSessionExpired(session));
  }

  // Get active sessions
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.is_active && !this.isSessionExpired(session));
  }

  // Get session statistics
  getSessionStats(): SessionStats {
    const now = Date.now();
    const activeSessions = this.getActiveSessions();
    const expiredSessions = Array.from(this.sessions.values())
      .filter(session => !session.is_active || this.isSessionExpired(session));

    const sessionsByUser: Record<string, number> = {};
    let totalDuration = 0;

    activeSessions.forEach(session => {
      sessionsByUser[session.userId] = (sessionsByUser[session.userId] || 0) + 1;
      totalDuration += new Date(session.expiresAt).getTime() - new Date(session.createdAt).getTime();
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
      const sortedSessions = sessions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      for (let i = 1; i < sortedSessions.length; i++) {
        const timeDiff = new Date(sortedSessions[i].createdAt).getTime() - new Date(sortedSessions[i-1].createdAt).getTime();
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
    return new Date(session.expiresAt).getTime() < Date.now();
  }

  // Initialize cleanup interval
  private initializeCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    let cleanedCount = 0;
    
    for (const session of this.sessions.values()) {
      if (session.is_active && this.isSessionExpired(session)) {
        session.is_active = false;
        this.sessions.set(session.id, session);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Configuration methods
  setSessionTimeout(timeout: number): void {
    this.sessionTimeout = timeout;
  }

  setMaxSessionsPerUser(max: number): void {
    this.maxSessionsPerUser = max;
  }

  // Activity tracking methods
  getUserActivity(userId: string, limit: number = 100): SessionActivity[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getSessionActivity(sessionId: string): SessionActivity[] {
    return this.activities
      .filter(activity => activity.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Security methods
  forceLogoutUser(userId: string, reason: string = 'Admin action'): number {
    const sessions = this.getUserSessions(userId);
    sessions.forEach(session => {
      session.is_active = false;
      this.sessions.set(session.id, session);
      this.logActivity(session.id, userId, 'force_logout', session.ipAddress, session.userAgent, { reason });
    });

    console.log(`🚫 Force logged out user ${userId}: ${reason}`);
    return sessions.length;
  }

  getSessionsByIP(ipAddress: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.ipAddress === ipAddress && session.is_active && !this.isSessionExpired(session));
  }

  blockIP(ipAddress: string, reason: string = 'Suspicious activity'): number {
    const sessions = this.getSessionsByIP(ipAddress);
    sessions.forEach(session => {
      session.is_active = false;
      this.sessions.set(session.id, session);
      this.logActivity(session.id, session.userId, 'ip_blocked', session.ipAddress, session.userAgent, { reason });
    });

    console.log(`🚫 Blocked IP ${ipAddress}: ${reason}`);
    return sessions.length;
  }

  // Analytics methods
  getSessionAnalytics(timeRange: number = 24 * 60 * 60 * 1000): {
    totalSessions: number;
    uniqueUsers: number;
    averageSessionsPerUser: number;
    mostActiveUsers: Array<{ userId: string; sessions: number; lastActivity: Date }>;
    sessionsByHour: Record<number, number>;
  } {
    const now = Date.now();
    const cutoff = now - timeRange;

    const recentSessions = Array.from(this.sessions.values())
      .filter(session => new Date(session.createdAt).getTime() > cutoff);

    const uniqueUsers = new Set(recentSessions.map(s => s.userId)).size;
    const sessionsByUser: Record<string, number> = {};
    const sessionsByHour: Record<number, number> = {};
    const userLastActivity: Record<string, Date> = {};

    recentSessions.forEach(session => {
      // Count sessions per user
      sessionsByUser[session.userId] = (sessionsByUser[session.userId] || 0) + 1;

      // Count sessions by hour
      const hour = new Date(session.createdAt).getHours();
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;

      // Track last activity per user
      const sessionDate = new Date(session.createdAt);
      if (!userLastActivity[session.userId] || sessionDate > userLastActivity[session.userId]) {
        userLastActivity[session.userId] = sessionDate;
      }
    });

    const mostActiveUsers = Object.entries(sessionsByUser)
      .map(([userId, sessions]) => ({
        userId,
        sessions,
        lastActivity: userLastActivity[userId]
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    return {
      totalSessions: recentSessions.length,
      uniqueUsers,
      averageSessionsPerUser: uniqueUsers > 0 ? recentSessions.length / uniqueUsers : 0,
      mostActiveUsers,
      sessionsByHour
    };
  }
}

export default SessionManager; 