import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    const token = generateCSRFToken();
    
    const response = NextResponse.json({ 
      token,
      expiresIn: 3600 // 1 hour in seconds
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // Set CSRF token in cookie for better persistence in serverless environments
    response.cookies.set('csrf-token', token, {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json({ 
      error: 'Failed to generate CSRF token' 
    }, { status: 500 });
  }
} 