import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth callback
  if (code) {
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(new URL('/auth/error?error=authentication_failed', request.url));
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.email);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      return NextResponse.redirect(new URL('/auth/error?error=authentication_failed', request.url));
    }
  }

  // Handle errors
  if (error) {
    console.error('Authentication error:', error, errorDescription);
    
    const params = new URLSearchParams();
    params.set('error', error);
    if (errorDescription) {
      params.set('error_description', errorDescription);
    }
    
    return NextResponse.redirect(new URL(`/auth/error?${params.toString()}`, request.url));
  }

  // Default redirect to login if no code or error
  return NextResponse.redirect(new URL('/login', request.url));
} 