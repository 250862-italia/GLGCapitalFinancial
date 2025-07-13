"use client";
import { useState, useEffect } from 'react';
import ClientLogoutButton from './ClientLogoutButton';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    const user = localStorage.getItem('user');
    const adminUser = localStorage.getItem('admin_user');
    setIsLoggedIn(!!user);
    setIsAdminLoggedIn(!!adminUser);
  }, []);

  // Don't render navigation until client is mounted to prevent hydration issues
  if (!isMounted) {
    return (
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
          <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About Us</a>
          <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
          <a href="/equity-pledge" style={{ color: '#fff', textDecoration: 'none' }}>Equity Pledge</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/register" style={{
            background: 'var(--accent)',
            color: 'var(--primary)',
            padding: '0.5rem 1rem',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>
            Client Registration
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
          <a href="/admin/login" style={{
            background: '#059669',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>
            Admin Access
          </a>
        </div>
      </nav>
    );
  }

  return (
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
        <a href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About Us</a>
        <a href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</a>
        <a href="/equity-pledge" style={{ color: '#fff', textDecoration: 'none' }}>Equity Pledge</a>
        {isLoggedIn && <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</a>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isLoggedIn && !isAdminLoggedIn && (
          <>
            <a href="/register" style={{
              background: 'var(--accent)',
              color: 'var(--primary)',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}>
              Client Registration
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
        {!isAdminLoggedIn && (
          <a href="/admin/login" style={{
            background: '#059669',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>
            Admin Access
          </a>
        )}
      </div>
    </nav>
  );
} 