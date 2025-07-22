"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const csrfData = await csrfResponse.json();

      // Check auth with CSRF token
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const csrfData = await csrfResponse.json();

      // Login with CSRF token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Login failed'
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login error'
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Login error' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const csrfData = await csrfResponse.json();

      // Register with CSRF token
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        router.push('/login?message=registration-success');
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Registration failed'
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration error'
      }));
      return { success: false, error: error instanceof Error ? error.message : 'Registration error' };
    }
  };

  const logout = async () => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();

        // Logout with CSRF token
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfData.token
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      router.push('/login');
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    checkAuth
  };
} 