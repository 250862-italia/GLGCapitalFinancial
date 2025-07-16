'use client';

import { useState } from 'react';
import { Mail, TestTube, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function EmailDebugPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    if (!email) {
      setError('Inserisci un indirizzo email');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/debug/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, testType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il test');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test: any) => {
    if (test.error) return 'error';
    if (test.success === false) return 'error';
    if (test.success === true) return 'success';
    return 'info';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200';
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Email System Debug</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tests</option>
                <option value="reset">Password Reset Only</option>
                <option value="custom">Custom Email Only</option>
              </select>
            </div>
          </div>

          <button
            onClick={runTest}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <TestTube className="w-5 h-5" />
            )}
            {loading ? 'Running Tests...' : 'Run Email Tests'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <div className="text-sm text-gray-500">
                Request ID: {results.requestId}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{results.summary.totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.summary.successfulTests}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.summary.failedTests}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(results.tests).map(([testName, testData]: [string, any]) => {
                const status = getTestStatus(testData);
                return (
                  <div
                    key={testName}
                    className={`p-4 border rounded-lg ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                    </div>
                    
                    <div className="ml-8">
                      {testData.error && (
                        <div className="text-sm mb-2">
                          <strong>Error:</strong> {testData.error}
                        </div>
                      )}
                      
                      {testData.success !== undefined && (
                        <div className="text-sm mb-2">
                          <strong>Status:</strong> {testData.success ? 'Success' : 'Failed'}
                        </div>
                      )}
                      
                      {testData.message && (
                        <div className="text-sm mb-2">
                          <strong>Message:</strong> {testData.message}
                        </div>
                      )}
                      
                      {testData.userId && (
                        <div className="text-sm mb-2">
                          <strong>User ID:</strong> {testData.userId}
                        </div>
                      )}
                      
                      {testData.hasActionLink !== undefined && (
                        <div className="text-sm mb-2">
                          <strong>Action Link:</strong> {testData.hasActionLink ? 'Available' : 'Missing'}
                        </div>
                      )}
                      
                      {testData.actionLinkPreview && (
                        <div className="text-sm mb-2">
                          <strong>Link Preview:</strong> {testData.actionLinkPreview}
                        </div>
                      )}
                      
                      {testData.inSupabaseAuth !== undefined && (
                        <div className="text-sm mb-2">
                          <strong>In Supabase Auth:</strong> {testData.inSupabaseAuth ? 'Yes' : 'No'}
                        </div>
                      )}
                      
                      {testData.inCustomTable !== undefined && (
                        <div className="text-sm mb-2">
                          <strong>In Custom Table:</strong> {testData.inCustomTable ? 'Yes' : 'No'}
                        </div>
                      )}
                      
                      {testData.customUserData && (
                        <div className="text-sm mb-2">
                          <strong>Custom User Data:</strong>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(testData.customUserData, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {testData.recentEmails && testData.recentEmails.length > 0 && (
                        <div className="text-sm mb-2">
                          <strong>Recent Emails:</strong>
                          <div className="mt-1 space-y-1">
                            {testData.recentEmails.map((email: any, index: number) => (
                              <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                                <div><strong>Subject:</strong> {email.subject}</div>
                                <div><strong>Status:</strong> {email.status}</div>
                                <div><strong>Created:</strong> {new Date(email.created_at).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {testData.note && (
                        <div className="text-sm text-gray-600 italic">
                          {testData.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Duration:</strong> {results.duration}ms
              </div>
              <div className="text-sm text-gray-600">
                <strong>Timestamp:</strong> {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 