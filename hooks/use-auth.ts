"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/logout-manager';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  client?: {
    client_code: string;
    status: string;
    risk_profile: string;
    total_invested: number;
  };
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
  const hasCheckedAuth = useRef(false);

  // Check auth on mount
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuth();
      hasCheckedAuth.current = true;
    }
  }, []);

  const checkAuth = useCallback(async () => {
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

      // Check auth with CSRF token using the new endpoint
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
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
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  }, []);

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

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        hasCheckedAuth.current = true; // Marca come controllato
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

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        hasCheckedAuth.current = true; // Marca come controllato
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
      console.log('🔄 useAuth: Starting logout...');
      
      await logoutUser({
        redirectTo: '/login',
        clearUserData: true,
        showConfirmation: false
      });
      
      // The logout manager handles the redirect, but we still need to update state
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      hasCheckedAuth.current = false; // Reset per permettere nuovo controllo
    } catch (error) {
      console.error('❌ useAuth: Logout error:', error);
      // Even if there's an error, clear state and redirect
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      hasCheckedAuth.current = false;
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