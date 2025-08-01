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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">GLG Capital Group</h1>
          <p className="text-slate-300 text-lg">Financial Services</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create your account
            </h2>
            <p className="text-slate-300">
              Or{' '}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-200 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                    errors.firstName ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-200 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                    errors.lastName ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Country Field */}
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-slate-200 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                  errors.country ? 'border-red-400' : 'border-white/20'
                }`}
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="" className="text-slate-800">Select your country</option>
                <option value="Italy" className="text-slate-800">Italy</option>
                <option value="United States" className="text-slate-800">United States</option>
                <option value="United Kingdom" className="text-slate-800">United Kingdom</option>
                <option value="Germany" className="text-slate-800">Germany</option>
                <option value="France" className="text-slate-800">France</option>
                <option value="Spain" className="text-slate-800">Spain</option>
                <option value="Other" className="text-slate-800">Other</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-400">{errors.country}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-400 border-white/20 rounded bg-white/10"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-300">
                I accept the{' '}
                <Link href="/terms" className="text-amber-400 hover:text-amber-300 font-semibold">
                  terms and conditions
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-400">{errors.acceptTerms}</p>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-200">
                      Registration Error
                    </h3>
                    <div className="mt-2 text-sm text-red-300">
                      <p>{submitError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Information */}
            {debugInfo && (
              <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-200">
                      Debug Information
                    </h3>
                    <div className="mt-2 text-sm text-slate-300">
                      <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            By creating an account, you agree to our{' '}
            <Link href="/privacy" className="text-amber-400 hover:text-amber-300">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-amber-400 hover:text-amber-300">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 