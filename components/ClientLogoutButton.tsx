"use client";
import { useSafeRouter } from '@/lib/safe-router';

export default function ClientLogoutButton({ onLogout }: { onLogout?: () => void }) {
  const router = useSafeRouter();

  const handleLogout = () => {
    try {
      // Clear all user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      
      // Clear any cookies
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      if (onLogout) onLogout();
      
      // Force redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: '#dc2626',
        color: '#fff',
        padding: '0.5rem 1.25rem',
        borderRadius: 6,
        fontWeight: 700,
        border: 'none',
        marginLeft: '1rem',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(34,40,49,0.07)'
      }}
    >
      Logout
    </button>
  );
} 