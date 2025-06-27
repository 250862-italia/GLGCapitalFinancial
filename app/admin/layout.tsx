"use client";
import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart3, 
  Package, 
  CheckCircle, 
  Users, 
  CreditCard, 
  Home,
  Shield,
  Mail
} from 'lucide-react';
import PackageProviderWrapper from '../package-provider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Packages', href: '/admin/packages', icon: Package },
    { name: 'KYC Management', href: '/admin/kyc', icon: CheckCircle },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Surveillance', href: '/admin/analytics/surveillance', icon: Shield },
    { name: 'Email Config', href: '/admin/settings/email', icon: Mail },
  ];

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
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Management Dashboard</p>
                </div>
              </div>
              <nav style={{ display: 'flex', gap: '2rem' }}>
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

        {/* ADMIN NAVIGATION */}
        <nav style={{ background: '#1f2937', borderBottom: '1px solid #374151' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                      transition: 'all 0.2s ease'
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

        {/* Main content */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          {children}
        </main>

        {/* ADMIN FOOTER */}
        <footer style={{ background: '#1f2937', borderTop: '1px solid #374151', marginTop: 'auto' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              GLG Capital Group LLC - Administrative Console | Secure Access Only
            </div>
          </div>
        </footer>
      </div>
    </PackageProviderWrapper>
  );
} 