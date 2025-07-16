'use client';

export const dynamic = "force-dynamic";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const errorDescription = searchParams?.get('error_description');

  const getErrorInfo = () => {
    switch (error) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          message: 'You have denied access to your account.',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'otp_expired':
        return {
          title: 'Email Link Expired',
          message: 'The email verification link has expired. Please request a new one.',
          icon: Mail,
          color: 'text-orange-600'
        };
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          message: 'The authentication request was invalid.',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'server_error':
        return {
          title: 'Server Error',
          message: 'A server error occurred during authentication.',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      case 'temporarily_unavailable':
        return {
          title: 'Service Temporarily Unavailable',
          message: 'The authentication service is temporarily unavailable.',
          icon: AlertTriangle,
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Authentication Error',
          message: errorDescription || 'An error occurred during authentication.',
          icon: AlertTriangle,
          color: 'text-red-600'
        };
    }
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <div className={`mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4`}>
              <IconComponent className={`h-6 w-6 ${errorInfo.color}`} />
            </div>
            <h3 className={`text-lg font-medium ${errorInfo.color} mb-2`}>
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {errorInfo.message}
            </p>
          </div>

          <div className="space-y-4">
            {error === 'otp_expired' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 mb-3">
                  To resolve this issue:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check your email for a new verification link</li>
                  <li>• Make sure to click the link within 24 hours</li>
                  <li>• Check your spam folder if you don't see the email</li>
                </ul>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Link
                href="/login"
                className="btn-primary w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
              
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Account
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 