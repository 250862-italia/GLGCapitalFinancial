import { useState, useEffect, useCallback } from 'react';
import { csrfManager, fetchProfile, checkSession, cleanupOnLogout } from '@/lib/csrf-client';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  client?: any;
}

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have a valid session first
      if (!checkSession()) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const profileData = await fetchProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfileData();
  }, [fetchProfileData]);

  const logout = useCallback(async () => {
    try {
      // Clear CSRF tokens
      cleanupOnLogout();
      
      // Clear profile
      setProfile(null);
      setError(null);
      
      // You can add additional logout logic here
      // For example, calling a logout API endpoint
      
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    logout
  };
}

// Utility function to check if user is authenticated
export function useAuthStatus(): { isAuthenticated: boolean; loading: boolean } {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a valid session
        const hasSession = checkSession();
        
        if (hasSession) {
          // Optionally verify with server
          try {
            await fetchProfile();
            setIsAuthenticated(true);
          } catch (err) {
            // Profile fetch failed, user not authenticated
            setIsAuthenticated(false);
            cleanupOnLogout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
} 