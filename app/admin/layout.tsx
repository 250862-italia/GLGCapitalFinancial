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
import '../globals.css';

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
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    return null;
  }

  // DISABILITATO controllo autenticazione e ruolo per sviluppo
  // if (!isAuthenticated) { ... }
  // if (!isSuperAdmin) { ... }
  // Mostra sempre il contenuto admin per ora

  return (
    <PackageProviderWrapper>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        {/* Sidebar */}
        <aside style={{
          width: 240,
          background: '#0a2540',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1rem 1rem 1rem',
          minHeight: '100vh'
        }}>
          <div style={{ marginBottom: 32 }}>
            <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={48} height={48} style={{ borderRadius: 8, background: '#fff' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '1rem 0 0.5rem' }}>GLG Console</h2>
          </div>
          <nav style={{ flex: 1 }}>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: 6,
                  marginBottom: 4,
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 500,
              marginTop: 24
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <header style={{ background: '#fff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0' }}>
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
                </nav>
              </div>
            </div>
          </header>

          {/* Welcome Block - always visible */}
          <div style={{
            maxWidth: '1280px',
            margin: '2rem auto 0',
            padding: '0 1rem',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '1rem 2rem',
              color: '#166534',
              fontWeight: 600,
              fontSize: 18,
              textAlign: 'center',
              minWidth: 320
            }}>
              Welcome, {adminUser?.name || 'Admin'} ({adminUser?.role || 'admin'})
            </div>
          </div>

          {/* Page content */}
          <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>
            {children}
          </div>
        </div>
      </div>
    </PackageProviderWrapper>
  );
} 