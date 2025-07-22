"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Button clicked! Form data:', formData);
    
    if (!formData.email.trim() || !formData.password.trim()) {
      console.log('❌ Form validation failed - empty fields');
      setError('Please fill in all fields');
      return;
    }

    console.log('✅ Form validation passed, starting login...');
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Frontend: Invio richiesta di login...');
      console.log('📤 Frontend: Dati inviati:', { email: formData.email });

      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const csrfData = await csrfResponse.json();

      // Login with CSRF token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      
      console.log('📥 Frontend: Risposta ricevuta');
      console.log('📥 Frontend: Login result:', data);

      if (response.ok && data.success) {
        console.log('✅ Frontend: Login riuscito, reindirizzamento...');
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        console.log('❌ Frontend: Login fallito, imposto errore:', data.error);
        const errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error) || 'Login failed';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Frontend: Errore durante il login:', err);
      const errorMessage = typeof err === 'string' ? err : err?.message || err?.error || 'Network error. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: 450
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: 16,
            color: '#6b7280',
            margin: 0
          }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} />
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#16a34a'
          }}>
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151'
            }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151'
            }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 14, color: '#374151' }}>
              <input
                type="checkbox"
                checked={false} // This state is no longer managed here
                onChange={(e) => {}} // This handler is no longer needed
              />
              Remember me
            </label>
            <Link href="/forgot-password" style={{
              fontSize: 14,
              color: '#059669',
              textDecoration: 'underline'
            }}>
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: isLoading ? '#e5e7eb' : '#059669',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: 8,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            fontWeight: 600,
            marginBottom: '1.5rem',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#047857';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#059669';
            }
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#f3f4f6',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            <div>Email: {formData.email ? '✓' : '✗'}</div>
            <div>Password: {formData.password ? '✓' : '✗'}</div>
            <div>Loading: {isLoading ? '✓' : '✗'}</div>
            <div>Button disabled: {isLoading ? '✓' : '✗'}</div>
            
            {/* Test Button */}
            <button
              onClick={() => {
                console.log('🧪 Test button clicked!');
                setFormData({
                  email: 'test_button@example.com',
                  password: 'test123'
                });
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              Fill Test Data
            </button>
          </div>
        )}

        {/* Register Link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#059669', textDecoration: 'underline', fontWeight: 600 }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
