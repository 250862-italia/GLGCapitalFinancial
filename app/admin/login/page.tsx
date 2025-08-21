'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', credentials);
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Making API call to /api/admin/auth/login');
      
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        setSuccess('Login effettuato con successo! Reindirizzamento...');
        
        // Store admin token
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        console.log('Token stored in localStorage:', {
          token: data.token,
          user: data.user,
          adminToken: localStorage.getItem('adminToken'),
          adminUser: localStorage.getItem('adminUser')
        });
        
        // Redirect to admin dashboard
        setTimeout(() => {
          console.log('Redirecting to /admin');
          router.push('/admin');
        }, 1500);
      } else {
        const errorData = await response.json();
        console.log('Login failed:', errorData);
        setError(errorData.message || 'Credenziali non valide');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <GLGLogo size="md" showText={false} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Access
          </h2>
          <p className="text-gray-600">
            Accedi al pannello di amministrazione GLG Capital Group
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="glgcapital2024"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-lg">
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="text-green-600 bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Accesso in corso...</span>
                </div>
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p><strong>Debug:</strong> Username: {credentials.username}</p>
            <p><strong>Debug:</strong> Password: {credentials.password ? '***' : 'vuota'}</p>
            <p><strong>Debug:</strong> Loading: {isLoading ? 'true' : 'false'}</p>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              ← Torna alla Homepage
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 GLG Capital Group LLC. Tutti i diritti riservati.</p>
          <p className="mt-1">Accesso riservato al personale autorizzato</p>
        </div>
      </div>
    </div>
  );
}
