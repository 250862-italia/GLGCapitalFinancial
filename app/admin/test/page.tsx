'use client';

import { useState, useEffect } from 'react';

export default function AdminTestPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [authStatus, setAuthStatus] = useState('checking');

  useEffect(() => {
    // Check localStorage
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    setLocalStorageData({
      adminToken: adminToken ? `${adminToken.substring(0, 50)}...` : 'null',
      adminUser: adminUser ? JSON.parse(adminUser) : 'null',
      allKeys: Object.keys(localStorage).filter(key => key.includes('admin'))
    });

    if (adminToken && adminUser) {
      setAuthStatus('authenticated');
    } else {
      setAuthStatus('not_authenticated');
    }
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'glgcapital2024' }),
      });

      const data = await response.json();
      console.log('Test login response:', data);

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        setAuthStatus('authenticated');
        window.location.reload();
      }
    } catch (error) {
      console.error('Test login error:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAuthStatus('not_authenticated');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Pagina Admin</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stato Autenticazione</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                authStatus === 'authenticated' ? 'bg-green-100 text-green-800' :
                authStatus === 'not_authenticated' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {authStatus === 'authenticated' ? '✅ Autenticato' :
                 authStatus === 'not_authenticated' ? '❌ Non Autenticato' :
                 '⏳ Controllando...'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">adminToken:</h3>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                  {localStorageData.adminToken}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">adminUser:</h3>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {localStorageData.adminUser ? JSON.stringify(localStorageData.adminUser, null, 2) : 'null'}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Chiavi localStorage (admin):</h3>
              <div className="bg-gray-100 p-2 rounded text-sm">
                {localStorageData.allKeys?.join(', ') || 'nessuna'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Test</h2>
          <div className="flex space-x-4">
            <button
              onClick={testLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔐 Test Login
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Cancella Auth
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Ricarica Pagina
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            <p><strong>Console:</strong> Apri la console del browser per vedere i log di debug</p>
          </div>
        </div>
      </div>
    </div>
  );
}
