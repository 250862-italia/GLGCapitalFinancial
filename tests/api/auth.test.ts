// Test per API Routes di Autenticazione
// Test completi per login, register, logout

import { NextRequest } from 'next/server';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { testUtils } from '../setup';

describe('Auth API Routes', () => {
  describe('POST /api/auth/login', () => {
    const createLoginRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify(body),
      });
    };

    it('should login successfully with valid credentials', async () => {
      // Mock Supabase auth response
      const mockAuthResponse = {
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { name: 'Test User' },
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      };

      // Mock the Supabase client
      const { supabase } = require('@/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

      // Mock client data
      const mockClientResponse = {
        data: {
          id: 'test-client-id',
          client_code: 'CLI001',
          status: 'active',
          risk_profile: 'moderate',
          total_invested: 10000,
        },
        error: null,
      };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockClientResponse),
      });

      const request = createLoginRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
      expect(data.session).toBeDefined();
      expect(data.csrfToken).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const mockAuthError = {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue(mockAuthError);

      const request = createLoginRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.message).toContain('Credenziali non valide');
    });

    it('should return error for unconfirmed email', async () => {
      const mockAuthError = {
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' },
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue(mockAuthError);

      const request = createLoginRequest({
        email: 'unconfirmed@example.com',
        password: 'password123',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Email non confermata');
    });

    it('should return error for missing email', async () => {
      const request = createLoginRequest({
        password: 'password123',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for missing password', async () => {
      const request = createLoginRequest({
        email: 'test@example.com',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for invalid email format', async () => {
      const request = createLoginRequest({
        email: 'invalid-email',
        password: 'password123',
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    const createRegisterRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify(body),
      });
    };

    it('should register successfully with valid data', async () => {
      const mockAuthResponse = {
        data: {
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
          },
          session: null,
        },
        error: null,
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signUp.mockResolvedValue(mockAuthResponse);

      const request = createRegisterRequest({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        first_name: 'New',
        last_name: 'User',
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Registrazione completata');
    });

    it('should return error for existing email', async () => {
      const mockAuthError = {
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signUp.mockResolvedValue(mockAuthError);

      const request = createRegisterRequest({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for weak password', async () => {
      const request = createRegisterRequest({
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return error for missing required fields', async () => {
      const request = createRegisterRequest({
        email: 'test@example.com',
        // Missing password and name
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    const createLogoutRequest = () => {
      return new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
      });
    };

    it('should logout successfully', async () => {
      const mockAuthResponse = {
        error: null,
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signOut.mockResolvedValue(mockAuthResponse);

      const request = createLogoutRequest();

      const response = await logoutHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Logout completato');
    });

    it('should handle logout error gracefully', async () => {
      const mockAuthError = {
        error: { message: 'Logout failed' },
      };

      const { supabase } = require('@/lib/supabase');
      supabase.auth.signOut.mockResolvedValue(mockAuthError);

      const request = createLogoutRequest();

      const response = await logoutHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should include request ID in error responses', async () => {
      const { supabase } = require('@/lib/supabase');
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Test error'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(data.requestId).toBeDefined();
      expect(typeof data.requestId).toBe('string');
    });
  });

  describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing X-CSRF-Token
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('CSRF token validation failed');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify({
          email: 'invalid-email-format',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate password length', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        }),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
}); 