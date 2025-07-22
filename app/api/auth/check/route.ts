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

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Aggiungi request ID se non presente
  addRequestId(request);
  
  console.log('🔍 Auth Check: Starting authentication check...');
  
  // Validazione CSRF
  const csrfValidation = validateCSRFToken(request);
  if (!csrfValidation.valid) {
    console.log('❌ Auth Check: CSRF validation failed');
    return NextResponse.json({
      error: 'CSRF validation failed',
      details: csrfValidation.error
    }, { status: 403 });
  }

  console.log('✅ Auth Check: CSRF validation passed');

  try {
    // Ottieni i cookie dalla richiesta
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('🍪 Auth Check: Cookie header present:', cookieHeader ? 'Yes' : 'No');
    
    // Estrai il token di accesso dai cookie
    const accessTokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
    
    console.log('🔑 Auth Check: Access token found:', accessToken ? 'Yes' : 'No');
    
    if (!accessToken) {
      console.log('❌ Auth Check: No access token found in cookies');
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    // Verifica il token usando il service role
    console.log('🔍 Auth Check: Verifying token with service role...');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('❌ Auth Check: Error verifying token:', error);
      return NextResponse.json({
        authenticated: false,
        error: 'Errore durante il controllo della sessione'
      }, { status: 401 });
    }

    if (!user) {
      console.log('❌ Auth Check: No user found for token');
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    console.log('✅ Auth Check: User verified:', user.email);

    // Recupera dati cliente se disponibili
    let clientData = null;
    try {
      console.log('🔍 Auth Check: Fetching client data...');
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError) {
        console.log('⚠️ Auth Check: Client data not found:', clientError.message);
      } else {
        console.log('✅ Auth Check: Client data retrieved successfully');
        clientData = client;
      }
    } catch (error) {
      console.error('❌ Auth Check: Error retrieving client data:', error);
    }

    // Prepara risposta
    const userName = user.user_metadata?.name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                    'Utente';
    const userRole = 'user';
    
    const responseData = {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: userName,
        role: userRole,
        client: clientData ? {
          client_code: clientData.client_code,
          status: clientData.status,
          risk_profile: clientData.risk_profile,
          total_invested: clientData.total_invested
        } : null
      }
    };

    console.log('✅ Auth Check: Authentication successful, returning user data');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('❌ Auth Check: General error during authentication check:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Errore durante il controllo dell\'autenticazione'
    }, { status: 500 });
  }
}); 