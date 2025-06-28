"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to analytics dashboard
    router.push('/admin/analytics/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
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
        <p style={{ color: '#64748b' }}>Redirecting to Analytics Dashboard...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
} 