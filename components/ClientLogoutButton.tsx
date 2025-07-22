"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function ClientLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔄 Frontend: Starting logout process...');
      
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

      // Logout with CSRF token
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include'
      });

      if (response.ok) {
        console.log('✅ Frontend: Logout successful');
        
        // Clear any local storage data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('csrf_token');
        
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('❌ Frontend: Logout failed');
        // Even if logout fails, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Frontend: Logout error:', error);
      // Even if there's an error, redirect to login
      router.push('/login');
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