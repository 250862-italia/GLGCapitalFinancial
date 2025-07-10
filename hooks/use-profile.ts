import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';

interface ClientProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company?: string;
  position?: string;
  date_of_birth?: string;
  nationality?: string;
  photo_url?: string;
  iban?: string;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
  status: string;
  kyc_status: string;
  country?: string;
  city?: string;
  address?: string;
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
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // Get client profile
      let { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('"user_id"', user.id)
        .single();

      if (clientError && clientError.code === 'PGRST116') {
        // Profile not found, create it automatically
        console.log('No client profile found for user:', user.id, '- Creating profile automatically');
        
        const newProfile = await createProfile(user.id);
        if (newProfile) {
          clientData = newProfile;
        } else {
          setError('Failed to create profile');
          return;
        }
      } else if (clientError) {
        console.error('Error loading client profile:', clientError);
        setError('Failed to load profile data');
        return;
      }

      if (!clientData) {
        setError('No profile found');
        return;
      }

      setProfile(clientData);
    } catch (error) {
      console.error('Profile loading error:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ClientProfile>): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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