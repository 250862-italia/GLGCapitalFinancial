import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    emailService: process.env.EMAIL_SERVICE,
    resendApiKeyExists: !!process.env.RESEND_API_KEY,
    resendApiKeyLength: process.env.RESEND_API_KEY?.length,
    resendApiKeyPreview: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
    sendgridApiKeyExists: !!process.env.SENDGRID_API_KEY,
    useLocalDatabase: process.env.USE_LOCAL_DATABASE,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
  });
} 