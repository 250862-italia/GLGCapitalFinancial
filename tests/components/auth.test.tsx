// Test per Componenti React di Autenticazione
// Test per login, register, e componenti correlati

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { testUtils } from '../setup';

// Mock component per testare useAuth
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('test@example.com', 'password123')}>
          Login
        </button>
      )}
    </div>
  );
};

// Mock per fetchJSONWithCSRF
jest.mock('@/lib/csrf-client', () => ({
  fetchJSONWithCSRF: jest.fn(),
}));

describe('Auth Components', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should render children when not loading', () => {
      render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should load user from localStorage on mount', async () => {
      const mockUser = testUtils.mockUser;
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
      });
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('user', 'invalid-json');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not crash and should show login button
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  describe('useAuth Hook', () => {
    it('should provide login function', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      fetchJSONWithCSRF.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: testUtils.mockUser,
          session: { access_token: 'test-token' },
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(fetchJSONWithCSRF).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        });
      });
    });

    it('should handle login success', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      const mockUser = testUtils.mockUser;
      
      fetchJSONWithCSRF.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
          session: { access_token: 'test-token' },
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
      });

      // Check that user data was stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    it('should handle login failure', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      
      fetchJSONWithCSRF.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid credentials',
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));

      // Should still show login button after failed login
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    it('should handle network errors during login', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      
      fetchJSONWithCSRF.mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));

      // Should still show login button after network error
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    it('should provide logout function', async () => {
      // Set up logged in user
      const mockUser = testUtils.mockUser;
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      // Check that user data was cleared from localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should provide register function', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      
      fetchJSONWithCSRF.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Registration successful',
        }),
      });

      const TestRegisterComponent = () => {
        const { register } = useAuth();
        
        const handleRegister = () => {
          register({
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
          });
        };

        return <button onClick={handleRegister}>Register</button>;
      };

      render(
        <AuthProvider>
          <TestRegisterComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(fetchJSONWithCSRF).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
          }),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid response format', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      
      fetchJSONWithCSRF.mockResolvedValue({
        ok: true,
        json: async () => ({
          // Missing user data
          success: true,
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Login'));

      // Should handle invalid response gracefully
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    it('should handle localStorage errors', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const mockUser = testUtils.mockUser;
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not crash
      expect(screen.getByText('Login')).toBeInTheDocument();

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Integration Tests', () => {
    it('should maintain user state across component re-renders', async () => {
      const mockUser = testUtils.mockUser;
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
      });

      // Re-render the component
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // User state should persist
      expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
    });

    it('should handle multiple login attempts', async () => {
      const { fetchJSONWithCSRF } = require('@/lib/csrf-client');
      
      fetchJSONWithCSRF
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            success: false,
            error: 'Invalid credentials',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            user: testUtils.mockUser,
            session: { access_token: 'test-token' },
          }),
        });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      // First login attempt (fails)
      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });

      // Second login attempt (succeeds)
      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText(`Welcome, ${testUtils.mockUser.name}`)).toBeInTheDocument();
      });
    });
  });
}); 