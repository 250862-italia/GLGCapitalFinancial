'use client';

import { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  message?: string;
}

export default function ConnectionStatus({ isConnected, message }: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 10000); // Hide after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!isVisible || isConnected) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '12px 16px',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        <div>
          <div style={{
            fontWeight: '600',
            color: '#92400e',
            fontSize: '14px'
          }}>
            Database Connection Issue
          </div>
          <div style={{
            color: '#92400e',
            fontSize: '12px',
            marginTop: '2px'
          }}>
            {message || 'Using demo data. Some features may be limited.'}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#92400e',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            marginLeft: 'auto'
          }}
        >
          ×
        </button>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
} 