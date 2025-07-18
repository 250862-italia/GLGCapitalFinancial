import { NextResponse } from 'next/server';
import { getCSRFTokenCount, clearCSRFTokens } from '@/lib/csrf';

export async function GET() {
  try {
    const tokenCount = getCSRFTokenCount();
    
    return NextResponse.json({
      tokenCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error getting CSRF storage info:', error);
    return NextResponse.json({ 
      error: 'Failed to get CSRF storage info' 
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearCSRFTokens();
    return NextResponse.json({ 
      message: 'CSRF tokens cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing CSRF tokens:', error);
    return NextResponse.json({ 
      error: 'Failed to clear CSRF tokens' 
    }, { status: 500 });
  }
} 