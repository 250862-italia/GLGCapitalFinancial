"use client";
import { useRouter } from 'next/navigation';

export default function ClientLogoutButton({ onLogout }: { onLogout?: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    if (onLogout) onLogout();
    router.push('/');
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