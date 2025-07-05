"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function TestLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@glgcapitalgroupllc.com');
  const [password, setPassword] = useState('GLG2024!Admin');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult('');

    try {
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        setResult(`✅ Login successful! Redirecting to dashboard...`);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setResult(`❌ Login failed: ${loginResult.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Login Page</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>
      
      <button 
        onClick={handleTestLogin} 
        disabled={loading}
        style={{ 
          padding: '0.75rem 1.5rem', 
          background: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: result.includes('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${result.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '4px'
        }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{result}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Test Credentials:</h3>
        <ul>
          <li><strong>Super Admin:</strong> admin@glgcapitalgroupllc.com / GLG2024!Admin</li>
          <li><strong>Admin:</strong> manager@glgcapitalgroupllc.com / GLG2024!Manager</li>
          <li><strong>Regular User:</strong> Try any email with password length &gt;= 6 (offline mode)</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
          Go to regular login page
        </a>
      </div>
    </div>
  );
} 