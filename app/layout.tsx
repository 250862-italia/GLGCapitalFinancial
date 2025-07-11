"use client";
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLogoutButton from '../components/ClientLogoutButton';
import { AuthProvider } from '@/hooks/use-auth';
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

  useEffect(() => {
    const user = localStorage.getItem('user');
    const adminUser = localStorage.getItem('admin_user');
    setIsLoggedIn(!!user);
    setIsAdminLoggedIn(!!adminUser);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <AuthProvider>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1 
          }}>
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
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!isLoggedIn && !isAdminLoggedIn && (
                <>
                  <a href="/iscriviti" style={{
                    background: 'var(--accent)',
                    color: 'var(--primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}>
                    Registrazione Clienti
                  </a>
                  <a href="/login" style={{
                    background: 'transparent',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    border: '1px solid #fff',
                    transition: 'all 0.3s ease'
                  }}>
                    Login
                  </a>
                </>
              )}
              {isLoggedIn && (
                <ClientLogoutButton onLogout={() => setIsLoggedIn(false)} />
              )}
              {isAdminLoggedIn && (
                <a href="/admin" style={{
                  background: '#dc2626',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}>
                  Admin Panel
                </a>
              )}
            </div>
          </nav>
          <LanguageSwitcher />
          {children}
          
          {/* Footer */}
          <footer style={{
            background: '#1f2937',
            color: '#fff',
            padding: '2rem',
            marginTop: 'auto'
          }}>
            <div style={{ 
              maxWidth: 1200, 
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>GLG Capital Consulting LLC</h3>
                <p style={{ lineHeight: 1.6, opacity: 0.8, marginBottom: '1rem' }}>
                  Empowering your financial future with innovative investment solutions and strategic capital management.
                </p>
                <div style={{ opacity: 0.8 }}>
                  <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Sede Legale:</strong><br />
                    1309 Coffeen Avenue, STE 1200<br />
                    Sheridan, Wyoming 82801 (USA)
                  </p>
                  <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Telefono:</strong> +1 (307) 674-XXXX
                  </p>
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quick Links</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/about" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>About Us</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/contact" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Contact</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/investments" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Investments</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Services</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/equity-pledge" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Equity Pledge</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/live-markets" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Live Markets</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="/kyc" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>KYC</a>
                  </li>
                </ul>
              </div>
            </div>
            <div style={{ 
              borderTop: '1px solid #374151', 
              marginTop: '2rem', 
              paddingTop: '1rem',
              textAlign: 'center',
              opacity: 0.6
            }}>
              <p>&copy; 2024 GLG Capital Consulting LLC. All rights reserved.</p>
            </div>
          </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
