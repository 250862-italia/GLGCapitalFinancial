"use client"

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: 500
      }}>
        <div style={{
          fontSize: 120,
          fontWeight: 700,
          color: '#e5e7eb',
          marginBottom: '1rem'
        }}>
          404
        </div>
        
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          fontSize: 16,
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to our homepage.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#059669',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'background-color 0.2s'
          }}>
            <Home size={20} />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 