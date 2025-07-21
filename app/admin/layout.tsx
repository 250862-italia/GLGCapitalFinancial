"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNotifications from '@/components/admin/AdminNotifications';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page to avoid redirect loops
      if (pathname === '/admin/login') {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      const adminUser = localStorage.getItem('admin_user');
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminUser || !adminToken) {
        router.push('/admin/login');
        return;
      }

      try {
        const adminData = JSON.parse(adminUser);
        if (adminData.role !== 'super_admin' && adminData.role !== 'superadmin') {
          router.push('/admin/login');
          return;
        }
        
        setIsAuthorized(true);
      } catch (e) {
        router.push('/admin/login');
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Verificando accesso admin...</p>
        </div>
        <style jsx>{`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to login
  }

  // Get admin user ID for notifications
  const getAdminId = () => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        const adminData = JSON.parse(adminUser);
        return adminData.id || 'admin';
      }
    } catch (e) {
      console.warn('Error parsing admin user data:', e);
    }
    return 'admin';
  };

  return (
    <>
      {/* Admin Header with Return to Dashboard button */}
      {pathname !== '/admin' && pathname !== '/admin/login' && (
        <div style={{
          background: '#1a2238',
          padding: '1rem 2rem',
          borderBottom: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1001
        }}>
          <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>
            GLG Capital Group - Admin Panel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Real-time notifications for admin */}
            <AdminNotifications adminId={getAdminId()} />
            <button
              onClick={() => {
                console.log('🔘 Return to Dashboard button clicked!');
                router.push('/admin');
              }}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s',
                position: 'relative',
                zIndex: 1002,
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
              onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: pathname !== '/admin' && pathname !== '/admin/login' ? '0' : '0',
        minHeight: 'calc(100vh - 80px)' // Account for header height
      }}>
        {children}
      </div>
    </>
  );
} 