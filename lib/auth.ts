import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Security Configuration
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_ALGORITHM: 'HS256',
  JWT_EXPIRES_IN: '24h',
  SESSION_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 12,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
}

// User Roles and Permissions
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface UserPermissions {
  canViewDashboard: boolean
  canManagePackages: boolean
  canManageUsers: boolean
  canManagePayments: boolean
  canViewAnalytics: boolean
  canManageSystem: boolean
}

export interface User {
  id: string
  email: string
  role: UserRole
  permissions: UserPermissions
  isActive: boolean
  lastLogin: Date
  loginAttempts: number
  lockedUntil?: Date
  twoFactorEnabled: boolean
  ipWhitelist?: string[]
}

// Login attempts tracking (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lockedUntil?: Date }>()

// JWT Token Management
export class TokenManager {
  private static secret = new TextEncoder().encode(SECURITY_CONFIG.JWT_SECRET)

  static async createToken(user: User): Promise<string> {
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    })
      .setProtectedHeader({ alg: SECURITY_CONFIG.JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(SECURITY_CONFIG.JWT_EXPIRES_IN)
      .sign(this.secret)

    return token
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, this.secret)
      return payload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  static async refreshToken(token: string): Promise<string> {
    const payload = await this.verifyToken(token)
    return this.createToken(payload as User)
  }
}

// Session Management
export class SessionManager {
  static async createSession(user: User, request: NextRequest): Promise<void> {
    const token = await TokenManager.createToken(user)
    const sessionData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SECURITY_CONFIG.SESSION_EXPIRES_IN),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SECURITY_CONFIG.SESSION_EXPIRES_IN / 1000,
      path: '/',
    })
  }

  static async getSession(): Promise<any> {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('session')
      
      if (!sessionCookie?.value) {
        return null
      }

      const sessionData = JSON.parse(sessionCookie.value)
      
      // Check if session is expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        await this.destroySession()
        return null
      }

      // Verify token
      const payload = await TokenManager.verifyToken(sessionData.token)
      return { ...sessionData, user: payload }
    } catch (error) {
      await this.destroySession()
      return null
    }
  }

  static async destroySession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  }

  static async refreshSession(): Promise<boolean> {
    const session = await this.getSession()
    if (!session) return false

    try {
      const newToken = await TokenManager.refreshToken(session.token)
      const cookieStore = await cookies()
      
      cookieStore.set('session', JSON.stringify({
        ...session,
        token: newToken,
        expiresAt: new Date(Date.now() + SECURITY_CONFIG.SESSION_EXPIRES_IN),
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SECURITY_CONFIG.SESSION_EXPIRES_IN / 1000,
        path: '/',
      })
      
      return true
    } catch (error) {
      await this.destroySession()
      return false
    }
  }
}

// Authentication Service
export class AuthService {
  static async authenticate(email: string, password: string, request: NextRequest): Promise<User> {
    // Check login attempts
    const attempts = loginAttempts.get(email)
    if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
      throw new Error(`Account locked. Try again after ${attempts.lockedUntil.toLocaleString()}`)
    }

    // Validate credentials (in production, check against database)
    const user = await this.validateCredentials(email, password)
    
    if (!user) {
      // Increment login attempts
      const currentAttempts = attempts?.count || 0
      const newAttempts = currentAttempts + 1
      
      if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION)
        loginAttempts.set(email, { count: newAttempts, lockedUntil })
        throw new Error(`Too many failed attempts. Account locked until ${lockedUntil.toLocaleString()}`)
      }
      
      loginAttempts.set(email, { count: newAttempts })
      throw new Error('Invalid credentials')
    }

    // Reset login attempts on successful login
    loginAttempts.delete(email)
    
    // Update user last login
    user.lastLogin = new Date()
    
    // Create session
    await SessionManager.createSession(user, request)
    
    return user
  }

  static async validateCredentials(email: string, password: string): Promise<User | null> {
    // In production, validate against database with proper password hashing
    // This is a simplified example
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return null
    }

    // Validate password strength
    if (!this.isPasswordStrong(password)) {
      return null
    }

    // Mock user validation (replace with database lookup)
    if (email === 'admin@glgcapitalgroupllc.com' && password === 'SecurePassword123!') {
      return {
        id: '1',
        email,
        role: UserRole.SUPER_ADMIN,
        permissions: {
          canViewDashboard: true,
          canManagePackages: true,
          canManageUsers: true,
          canManagePayments: true,
          canViewAnalytics: true,
          canManageSystem: true,
        },
        isActive: true,
        lastLogin: new Date(),
        loginAttempts: 0,
        twoFactorEnabled: false,
      }
    }

    return null
  }

  static isPasswordStrong(password: string): boolean {
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) return false
    if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
    if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) return false
    if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false
    if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false
    
    return true
  }

  static async logout(): Promise<void> {
    await SessionManager.destroySession()
  }

  static async getCurrentUser(): Promise<User | null> {
    const session = await SessionManager.getSession()
    return session?.user || null
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }

  static async requireRole(requiredRole: UserRole): Promise<User> {
    const user = await this.requireAuth()
    if (user.role !== requiredRole && user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Insufficient permissions')
    }
    return user
  }

  static async requirePermission(permission: keyof UserPermissions): Promise<User> {
    const user = await this.requireAuth()
    if (!user.permissions[permission] && user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Insufficient permissions')
    }
    return user
  }
}

// Security Utilities
export class SecurityUtils {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static generateSecureToken(): string {
    return crypto.randomUUID()
  }

  static hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or similar
    return Promise.resolve(password) // Simplified for demo
  }

  static comparePassword(password: string, hash: string): Promise<boolean> {
    // In production, use bcrypt.compare
    return Promise.resolve(password === hash) // Simplified for demo
  }
}

// Export default auth service
export default AuthService 