import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { useState, useEffect } from 'react'

// CSRF Configuration
const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  COOKIE_NAME: 'csrf-token',
  HEADER_NAME: 'x-csrf-token',
  EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
  SALT_LENGTH: 16,
}

// CSRF Token Management
export class CSRFProtection {
  private static generateToken(): string {
    return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex')
  }

  private static generateSalt(): string {
    return crypto.randomBytes(CSRF_CONFIG.SALT_LENGTH).toString('hex')
  }

  private static hashToken(token: string, salt: string): string {
    return crypto
      .createHmac('sha256', process.env.CSRF_SECRET || 'csrf-secret-key')
      .update(token + salt)
      .digest('hex')
  }

  static async generateCSRFToken(): Promise<string> {
    const token = this.generateToken()
    const salt = this.generateSalt()
    const hashedToken = this.hashToken(token, salt)
    
    const cookieStore = await cookies()
    cookieStore.set(CSRF_CONFIG.COOKIE_NAME, JSON.stringify({
      token: hashedToken,
      salt,
      expiresAt: new Date(Date.now() + CSRF_CONFIG.EXPIRES_IN),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_CONFIG.EXPIRES_IN / 1000,
      path: '/',
    })

    return token
  }

  static async validateCSRFToken(request: NextRequest): Promise<boolean> {
    try {
      // Get token from header
      const headerToken = request.headers.get(CSRF_CONFIG.HEADER_NAME)
      if (!headerToken) {
        return false
      }

      // Get stored token from cookie
      const cookieStore = await cookies()
      const csrfCookie = cookieStore.get(CSRF_CONFIG.COOKIE_NAME)
      
      if (!csrfCookie?.value) {
        return false
      }

      const storedData = JSON.parse(csrfCookie.value)
      
      // Check if token is expired
      if (new Date(storedData.expiresAt) < new Date()) {
        await this.clearCSRFToken()
        return false
      }

      // Validate token
      const expectedHash = this.hashToken(headerToken, storedData.salt)
      return expectedHash === storedData.token
    } catch (error) {
      return false
    }
  }

  static async clearCSRFToken(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(CSRF_CONFIG.COOKIE_NAME)
  }

  static async refreshCSRFToken(): Promise<string> {
    await this.clearCSRFToken()
    return this.generateCSRFToken()
  }

  static async getCSRFToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies()
      const csrfCookie = cookieStore.get(CSRF_CONFIG.COOKIE_NAME)
      
      if (!csrfCookie?.value) {
        return null
      }

      const storedData = JSON.parse(csrfCookie.value)
      
      // Check if token is expired
      if (new Date(storedData.expiresAt) < new Date()) {
        await this.clearCSRFToken()
        return null
      }

      return storedData.token
    } catch (error) {
      return null
    }
  }
}

// CSRF Middleware for API Routes
export function withCSRF(handler: Function) {
  return async (request: NextRequest) => {
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return handler(request)
    }

    // Validate CSRF token for non-GET requests
    const isValid = await CSRFProtection.validateCSRFToken(request)
    if (!isValid) {
      return new Response('CSRF token validation failed', { status: 403 })
    }

    return handler(request)
  }
}

// CSRF Hook for Client Components
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          setCsrfToken(data.token)
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCSRFToken()
  }, [])

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/csrf/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.token)
        return data.token
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error)
    }
    return null
  }

  return { csrfToken, loading, refreshToken }
}

// CSRF API Routes
export async function GET() {
  try {
    const token = await CSRFProtection.generateCSRFToken()
    return Response.json({ token })
  } catch (error) {
    return Response.json({ error: 'Failed to generate CSRF token' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await CSRFProtection.refreshCSRFToken()
    return Response.json({ token })
  } catch (error) {
    return Response.json({ error: 'Failed to refresh CSRF token' }, { status: 500 })
  }
}

// CSRF Utilities
export class CSRFUtils {
  static async addCSRFHeader(headers: Headers): Promise<Headers> {
    const token = await CSRFProtection.getCSRFToken()
    if (token) {
      headers.set(CSRF_CONFIG.HEADER_NAME, token)
    }
    return headers
  }

  static async validateFormData(formData: FormData): Promise<boolean> {
    const token = formData.get('csrf_token') as string
    if (!token) return false

    // Create a mock NextRequest to validate the token
    const mockRequest = new NextRequest('http://localhost', {
      headers: { [CSRF_CONFIG.HEADER_NAME]: token }
    })

    return CSRFProtection.validateCSRFToken(mockRequest)
  }

  static generateFormToken(): string {
    return crypto.randomBytes(16).toString('hex')
  }
}

// Export default CSRF protection
export default CSRFProtection 