"use client";
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLogoutButton from '../components/ClientLogoutButton';
// RIMOSSO: import { useRouter } from 'next/navigation'
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const inter = Inter({ subsets: ['latin'] });

// Forza il rendering dinamico per evitare problemi con useRouter
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  // RIMOSSO: const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user');
    const adminUser = localStorage.getItem('admin_user');
    setIsLoggedIn(!!user);
    setIsAdminLoggedIn(!!adminUser);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav style={{
          background: '#1f2937',
          color: '#fff',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>GLG Capital Group LLC</h1>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            {isLoggedIn && <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</a>}
            {isAdminLoggedIn && <a href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Admin</a>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn && (
              <ClientLogoutButton onLogout={() => setIsLoggedIn(false)} />
            )}
          </div>
        </nav>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}
