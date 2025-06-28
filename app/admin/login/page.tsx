"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import Image from 'next/image';

interface LoginData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    return formData.email.trim() !== '' && formData.password.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin privileges
        if (data.user.role === 'admin' || data.user.role === 'superadmin') {
          setSuccess('Login successful! Redirecting to Admin Console...');
          // Store user data in localStorage
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          localStorage.setItem('admin_token', data.token);
          
          // Redirect to admin dashboard after 1 second
          setTimeout(() => {
            router.push('/admin');
          }, 1000);
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
      background: 'linear-gradient(135deg, #1a2238 0%, #2a3f5f 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '3rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: 500
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Image 
              src="/glg capital group llcbianco.png" 
              alt="GLG Capital Group LLC" 
              width={80} 
              height={80} 
              style={{ borderRadius: 12, background: '#fff' }} 
            />
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Admin Console Access
          </h1>
          <p style={{
            fontSize: 16,
            color: '#6b7280',
            margin: 0
          }}>
            Secure administrative access to GLG Capital Group
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
            {error}
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

        {/* Admin Credentials Info */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            color: '#1f2937',
            fontWeight: 600
          }}>
            <Shield size={20} />
            Admin Credentials
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Superadmin:</strong> admin@glgcapitalgroupllc.com / GLG2024!Admin
            </div>
            <div>
              <strong>Admin:</strong> manager@glgcapitalgroupllc.com / GLG2024!Manager
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
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
                placeholder="Enter admin email address"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
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
                placeholder="Enter admin password"
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !validateForm()}
            style={{
              width: '100%',
              background: isLoading || !validateForm() ? '#9ca3af' : '#1a2238',
              color: 'white',
              padding: '1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: isLoading || !validateForm() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: 20,
                  height: 20,
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Authenticating...
              </>
            ) : (
              <>
                <User size={20} />
                Access Admin Console
              </>
            )}
          </button>
        </div>

        {/* Back to Site Link */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Main Site
          </button>
        </div>

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