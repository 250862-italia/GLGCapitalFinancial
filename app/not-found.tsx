"use client"

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <h1 style={{ fontSize: 64, fontWeight: 900, color: '#0a2540', marginBottom: 16 }}>404</h1>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a3556', marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: '#64748b', fontSize: 18, marginBottom: 32 }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <a href="/" style={{ background: '#0a2540', color: '#fff', padding: '0.75rem 2rem', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 18 }}>
        Go to Home
      </a>
    </main>
  );
} 