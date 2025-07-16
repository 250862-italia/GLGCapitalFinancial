'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams?.get('token');
    const type = searchParams?.get('type');

    if (!token) {
      setStatus('error');
      setMessage('No confirmation token provided.');
      return;
    }

    // Verifica reale del token con Supabase
    const verifyEmail = async () => {
      try {
        console.log('Verifying email token:', token);
        
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });
        
        if (error) {
          console.error('Email verification error:', error);
          setStatus('error');
          setMessage('Invalid or expired confirmation token. Please try registering again.');
        } else {
          console.log('Email verified successfully');
          setStatus('success');
          setMessage('Your email has been confirmed successfully! You can now log in to your account.');
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
        setMessage('Confirmation failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Email Confirmation
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirming your email...
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Email Confirmed!
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {message}
                </p>
                <button
                  onClick={handleContinue}
                  className="btn-primary w-full"
                >
                  Continue to Login
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Confirmation Failed
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="btn-primary w-full"
                  >
                    Back to Login
                  </Link>
                  <Link
                    href="/register"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Register Again
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 