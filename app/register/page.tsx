"use client";
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  country: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setDebugInfo('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    let debugLog = '';

    try {
      debugLog += '🔄 Starting registration...\n';
      
      // Step 1: Get CSRF token
      debugLog += '🔍 Getting CSRF token...\n';
      
      let csrfToken: string;
      try {
        const csrfResponse = await fetch('/api/csrf-public', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        debugLog += `📡 CSRF Response Status: ${csrfResponse.status}\n`;
        debugLog += `📡 CSRF Response OK: ${csrfResponse.ok}\n`;

        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.token;
          debugLog += `✅ CSRF Token obtained from server: ${csrfToken.substring(0, 10)}...\n`;
        } else {
          // Generate token locally if server is not available
          debugLog += `⚠️ Server not available, generating token locally...\n`;
          csrfToken = crypto.randomUUID ? crypto.randomUUID() : 
            Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
          debugLog += `✅ CSRF Token generated locally: ${csrfToken.substring(0, 10)}...\n`;
        }
      } catch (error) {
        // Generate token locally if there's an error
        debugLog += `⚠️ Server error, generating token locally...\n`;
        csrfToken = crypto.randomUUID ? crypto.randomUUID() : 
          Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
        debugLog += `✅ CSRF Token generated locally: ${csrfToken.substring(0, 10)}...\n`;
      }

      // Step 2: Register user with CSRF token
      debugLog += '🔍 Sending registration request...\n';
      
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country
      };

      debugLog += `📤 Data sent: ${JSON.stringify(registerData, null, 2)}\n`;

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(registerData)
      });

      debugLog += `📥 Register Response Status: ${registerResponse.status}\n`;
      debugLog += `📥 Register Response OK: ${registerResponse.ok}\n`;
      debugLog += `📥 Register Response Status Text: ${registerResponse.statusText}\n`;

      // Get response headers
      const responseHeaders = Object.fromEntries(registerResponse.headers.entries());
      debugLog += `📥 Response Headers: ${JSON.stringify(responseHeaders, null, 2)}\n`;

      // Read response body only once
      const responseData = await registerResponse.json();
      debugLog += `📥 Response Data: ${JSON.stringify(responseData, null, 2)}\n`;

      if (registerResponse.ok) {
        debugLog += '✅ Registration completed successfully!\n';
        setDebugInfo(debugLog);
        
        // Show success message briefly before redirect
        setSubmitError(''); // Clear any previous errors
        setTimeout(() => {
          router.push('/login?message=registration-success');
        }, 2000);
      } else {
        debugLog += `❌ Registration failed: ${responseData.error || 'Unknown error'}\n`;
        setDebugInfo(debugLog);
        setSubmitError(responseData.error || 'Error during registration');
      }

    } catch (error) {
      debugLog += `❌ Error during registration: ${error}\n`;
      setDebugInfo(debugLog);
      setSubmitError(error instanceof Error ? error.message : 'Error during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: '100vh' }}>
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.country ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="">Select your country</option>
                <option value="Italy">Italy</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Other">Other</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              I accept the{' '}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                terms and conditions
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms}</p>
          )}

          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Registration Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {debugInfo && (
            <div className="rounded-md bg-gray-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    Debug Information
                  </h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 