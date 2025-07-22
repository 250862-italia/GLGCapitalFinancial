import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
import { 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor,
  generateCacheKey
} from '@/lib/api-optimizer';
import { 
  withErrorHandling, 
  createValidationError, 
  createAuthError, 
  createInternalError,
  handleSupabaseError,
  addRequestId,
  generateRequestId
} from '@/lib/error-handler';

// Interface per il profilo utente
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  country: string;
  kyc_status: string;
  role: string;
  name?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = performanceMonitor.start('login_user');
  
  // Aggiungi request ID se non presente
  addRequestId(request);
  
  console.log('🔄 Login: Starting login process...');
  
  const body = await request.json();
  
  // Sanitizzazione input
  const sanitizedBody = sanitizeInput(body);
  
  // Validazione CSRF
  const csrfValidation = validateCSRFToken(request);
  if (!csrfValidation.valid) {
    console.log('❌ Login: CSRF validation failed');
    performanceMonitor.end('login_user', startTime);
    return NextResponse.json({
      error: 'CSRF validation failed',
      details: csrfValidation.error
    }, { status: 403 });
  }

  console.log('✅ Login: CSRF validation passed');

  // Validazione input robusta
  const validation = validateInput(sanitizedBody, {
    email: VALIDATION_SCHEMAS.email,
    password: VALIDATION_SCHEMAS.required
  });

  if (!validation.valid) {
    console.log('❌ Login: Input validation failed:', validation.errors);
    performanceMonitor.end('login_user', startTime);
    throw new Error(`Invalid input data: ${validation.errors.join(', ')}`);
  }

  const { email, password } = sanitizedBody;

  console.log('🔄 Login: Attempting login for user:', { email });

  // Autenticazione diretta con Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error('❌ Login: Authentication error:', authError);
    performanceMonitor.end('login_user', startTime);
    
    // Restituisci errori di autenticazione appropriati invece di lanciare eccezioni
    if (authError.message.includes('Invalid login credentials')) {
      return NextResponse.json({
        success: false,
        error: 'Credenziali non valide. Verifica email e password.',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }
    
    if (authError.message.includes('Email not confirmed')) {
      return NextResponse.json({
        success: false,
        error: 'Email non confermata. Controlla la tua casella email.',
        code: 'EMAIL_NOT_CONFIRMED'
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'accesso. Riprova più tardi.',
      code: 'AUTH_ERROR'
    }, { status: 500 });
  }

  if (!authData?.user) {
    console.error('❌ Login: No user data returned');
    performanceMonitor.end('login_user', startTime);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'autenticazione',
      code: 'AUTHENTICATION_FAILED'
    }, { status: 401 });
  }

  console.log('✅ Login: User authenticated successfully:', authData.user.id);

  // Recupera profilo utente (TEMPORANEAMENTE DISABILITATO per risolvere ricorsione)
  console.log('⚠️ Login: Profile retrieval temporarily disabled to resolve infinite recursion');
  
  // TODO: Riabilitare il recupero del profilo una volta risolta la ricorsione
  // const { data: profile, error: profileError } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', authData.user.id)
  //   .single();

  // Recupera dati cliente se disponibili (semplificato)
  let clientData = null;
  try {
    console.log('🔍 Login: Fetching client data...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (clientError) {
      console.error('❌ Login: Error retrieving client:', clientError);
    } else {
      console.log('✅ Login: Client data retrieved successfully');
      clientData = client;
    }
  } catch (error) {
    console.error('❌ Login: General error retrieving client:', error);
    console.log('⚠️ Login: Client not retrieved, but login continues');
  }

  // Genera nuovo CSRF token per la sessione
  const csrfToken = generateCSRFToken();
  console.log('✅ Login: New CSRF token generated');

  // Prepara risposta ottimizzata
  const userName = authData.user.user_metadata?.name || 'Utente';
  const userRole = 'user';
  
  const responseData = {
    success: true,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      name: userName,
      role: userRole,
      profile: null, // Temporaneamente disabilitato
      client: clientData ? {
        client_code: clientData.client_code,
        status: clientData.status,
        risk_profile: clientData.risk_profile,
        total_invested: clientData.total_invested
      } : null
    },
    session: {
      access_token: authData.session?.access_token,
      refresh_token: authData.session?.refresh_token,
      expires_at: authData.session?.expires_at
    },
    csrfToken,
    message: 'Accesso effettuato con successo'
  };

  const response = NextResponse.json(responseData, {
    headers: {
      'X-Performance': `${Date.now() - startTime}ms`,
      'X-User-Role': userRole
    }
  });

  // Set session cookies if available
  if (authData.session) {
    console.log('🍪 Login: Setting session cookies...');
    
    // Set the session cookie
    response.cookies.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authData.session.expires_in || 3600 // 1 hour default
    });

    if (authData.session.refresh_token) {
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }
  }

  console.log('✅ Login: Login process completed successfully');
  performanceMonitor.end('login_user', startTime);
  return response;

}); 