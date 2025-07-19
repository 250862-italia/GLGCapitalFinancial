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
      {/* Real-time notifications for admin */}
      <AdminNotifications adminId={getAdminId()} />
      {children}
    </>
  );
} 