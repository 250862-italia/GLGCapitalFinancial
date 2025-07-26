"use client";

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { logoutUser } from '@/lib/logout-manager';

export default function ClientLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔄 ClientLogoutButton: Starting logout...');
      
      // Use the unified logout manager
      const success = await logoutUser({
        redirectTo: '/login',
        clearUserData: true,
        showConfirmation: false
      });

      if (success) {
        console.log('✅ ClientLogoutButton: Logout successful');
      } else {
        console.log('❌ ClientLogoutButton: Logout failed');
        // Even if it fails, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ ClientLogoutButton: Logout error:', error);
      // Fallback redirect
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        transition: 'background 0.2s ease',
        opacity: isLoading ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#b91c1c';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#dc2626';
        }
      }}
    >
      <LogOut size={16} />
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
} 