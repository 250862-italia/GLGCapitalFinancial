"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import KYCProcess from '@/components/kyc/kyc-process';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function KYCPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [kycCompleted, setKycCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleKycComplete = (status: string) => {
    setKycCompleted(true);
    // Mostra messaggio di successo per 3 secondi, poi torna alla dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (kycCompleted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: '3rem',
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <CheckCircle size={64} color="#059669" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>
            KYC Completed!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Your KYC verification has been submitted successfully. You will receive a notification when the review is complete.
          </p>
          <p style={{ color: '#059669', fontWeight: 600 }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              KYC Verification
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Complete verification to start investing
            </p>
          </div>
        </div>

        {/* KYC Process */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <Shield size={48} style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, marginBottom: '0.5rem' }}>
              Know Your Customer (KYC)
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              KYC verification is mandatory to ensure security and regulatory compliance
            </p>
          </div>
          
          <div style={{ padding: '2rem' }}>
            <KYCProcess userId={user.id} onComplete={handleKycComplete} />
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bae6fd',
          borderRadius: 12,
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e40af', marginBottom: '1rem' }}>
            Why is KYC required?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#1e40af' }}>Security:</strong>
              <p style={{ color: '#374151', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                We protect our clients from fraud and illegal activities
              </p>
            </div>
            <div>
              <strong style={{ color: '#1e40af' }}>Compliance:</strong>
              <p style={{ color: '#374151', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                We comply with anti-money laundering (AML) regulations
              </p>
            </div>
            <div>
              <strong style={{ color: '#1e40af' }}>Transparency:</strong>
              <p style={{ color: '#374151', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                We ensure a safe and transparent investment environment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}