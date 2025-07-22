import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateCSRFToken } from '@/lib/csrf';
import { 
  withErrorHandling, 
  addRequestId
} from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Aggiungi request ID se non presente
  addRequestId(request);
  
  console.log('🔄 Logout: Starting logout process...');
  
  // Validazione CSRF
  const csrfValidation = validateCSRFToken(request);
  if (!csrfValidation.valid) {
    console.log('❌ Logout: CSRF validation failed');
    return NextResponse.json({
      error: 'CSRF validation failed',
      details: csrfValidation.error
    }, { status: 403 });
  }

  console.log('✅ Logout: CSRF validation passed');

  try {
    // Ottieni i cookie dalla richiesta
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Estrai il token di accesso dai cookie
    const accessTokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    
    if (accessToken) {
      console.log('🔍 Logout: Found access token, signing out...');
      
      // Effettua il logout con Supabase
      const { error: signOutError } = await supabase.auth.admin.signOut(accessToken);
      
      if (signOutError) {
        console.error('❌ Logout: Error during sign out:', signOutError);
      } else {
        console.log('✅ Logout: User signed out successfully');
      }
    } else {
      console.log('⚠️ Logout: No access token found');
    }

    // Prepara risposta
    const response = NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo'
    }, { status: 200 });

    // Rimuovi tutti i possibili cookie di sessione
    console.log('🍪 Logout: Clearing all session cookies...');
    
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token', 
      'sb-auth-token',
      'supabase-auth-token',
      'supabase-access-token',
      'supabase-refresh-token'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/'
      });
    });

    console.log('✅ Logout: Logout process completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Logout: General error during logout:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante il logout'
    }, { status: 500 });
  }
}); 