"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  CheckCircle, 
  Users, 
  CreditCard, 
  Home,
  Shield,
  Mail,
  LogOut
} from 'lucide-react';
import PackageProviderWrapper from '../package-provider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporarily set to true
  const [isLoading, setIsLoading] = useState(false); // Temporarily set to false
  const [adminUser, setAdminUser] = useState<any>(null); // Start as null

  useEffect(() => {
    // Recupera l'utente reale da localStorage
    const adminUserData = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_token');
    if (!adminUserData || !adminToken) {
      setIsAuthenticated(false);
      setAdminUser(null);
      return;
    }
    const user = JSON.parse(adminUserData);
    setAdminUser(user);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Content', href: '/admin/content', icon: Package },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Partnerships', href: '/admin/partnerships', icon: CheckCircle },
    { name: 'Settings', href: '/admin/settings', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Packages', href: '/admin/packages', icon: Package },
    { name: 'KYC Management', href: '/admin/kyc', icon: CheckCircle },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Surveillance', href: '/admin/analytics/surveillance', icon: Shield },
    { name: 'Email Config', href: '/admin/settings/email', icon: Mail },
  ];

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          <p style={{ color: '#64748b' }}>Verifying admin access...</p>
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

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontWeight: 700, fontSize: 20 }}>
          Accesso negato. Effettua il login come superadmin per accedere all'area riservata.
        </div>
      </div>
    );
  }

  // Accetta sia 'superadmin' che 'super_admin'
  const isSuperAdmin = adminUser?.role === 'superadmin' || adminUser?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontWeight: 700, fontSize: 20 }}>
          Accesso riservato ai superadmin.<br />Sei loggato come: {adminUser?.name} ({adminUser?.role})
        </div>
      </div>
    );
  }

  return (
    <PackageProviderWrapper>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        {/* Header */}
        <header style={{ background: '#fff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={50} height={50} style={{ borderRadius: 8, background: '#fff' }} />
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>GLG Admin Console</h1>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                    Welcome, {adminUser?.name} ({adminUser?.role})
                  </p>
                </div>
              </div>
              <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link 
                  href="/" 
                  style={{ 
                    color: '#6b7280', 
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  <Home size={16} />
                  Back to Site
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#b91c1c'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#dc2626'}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* ADMIN NAVIGATION */}
        {isSuperAdmin && (
        <nav style={{ background: '#1f2937', borderBottom: '1px solid #374151' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '4rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 'max-content' }}>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ 
                      color: '#d1d5db', 
                      textDecoration: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#374151';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        )}

        {/* Main content */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          {children}
        </main>

        {/* ADMIN FOOTER */}
        <footer style={{ background: '#1f2937', color: '#d1d5db', padding: '2rem 0', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              © 2024 GLG Capital Group LLC. All rights reserved.
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
              Admin Console v1.0 - Secure access only
            </p>
          </div>
        </footer>
      </div>
    </PackageProviderWrapper>
  );
} 