"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Edit,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  // Profile management only
}

export default function UserProfile({}: UserProfileProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
        textAlign: 'center'
      }}>
        <div style={{ animation: 'spin 1s linear infinite' }}> 3</div>
        <p>Loading profile...</p>
      </div>
    );
  }

      // Only show basic profile info, simplified system
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 16, 
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {user?.name || 'User'}
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>
      </div>
      {/* Add more client profile fields here as needed */}
    </div>
  );
} 