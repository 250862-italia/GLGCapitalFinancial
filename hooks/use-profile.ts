import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';

interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (user_id: string): Promise<ClientProfile | null> => {
    try {
      const response = await fetchJSONWithCSRF('/api/profile/create', {
        method: 'POST',
        body: JSON.stringify({ user_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('"user_id"', user.id)
        .single();
      if (clientError && clientError.code === 'PGRST116') {
        // Profile not found, create it automatically
        const newProfile = await createProfile(user.id);
        if (newProfile) {
          clientData = newProfile;
        } else {
          setError('Failed to create profile');
          return;
        }
      } else if (clientError) {
        setError('Failed to load profile data');
        return;
      }
      if (!clientData) {
        setError('No profile found');
        return;
      }
      setProfile(clientData);
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ClientProfile>): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const response = await fetchJSONWithCSRF('/api/profile/update', {
        method: 'PUT',
        body: JSON.stringify({
          userId: user.id,
          updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload profile data
        await loadProfile();
        return true;
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    createProfile
  };
} 