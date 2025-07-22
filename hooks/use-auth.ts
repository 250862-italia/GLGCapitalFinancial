"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  const isCheckingAuth = useRef(false);
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevenire chiamate multiple simultanee
    if (isCheckingAuth.current) {
      return;
    }

    // Se abbiamo già controllato l'auth e non stiamo caricando, non ricontrollare
    if (hasCheckedAuth.current && !authState.loading) {
      return;
    }

    isCheckingAuth.current = true;

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
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    } finally {
      isCheckingAuth.current = false;
      hasCheckedAuth.current = true;
    }
  }, [authState.loading]);

  useEffect(() => {
    // Controlla l'auth solo una volta al mount
    if (!hasCheckedAuth.current) {
      checkAuth();
    }
  }, []); // Dipendenze vuote per eseguire solo al mount

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
      hasCheckedAuth.current = false; // Reset per permettere nuovo controllo
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