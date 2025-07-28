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
import { safeAuthCall, safeDatabaseQuery } from '@/lib/supabase-safe';

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
  const requestId = generateRequestId();
  
  // Aggiungi request ID se non presente
  addRequestId(request);
  
  console.log(`🔄 Login [${requestId}]: Starting login process...`);
  console.log(`🔄 Login [${requestId}]: Environment: ${process.env.NODE_ENV}`);
  console.log(`🔄 Login [${requestId}]: Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.log(`🔄 Login [${requestId}]: Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'}`);
  
  try {
    const body = await request.json();
    
    // Sanitizzazione input
    const sanitizedBody = sanitizeInput(body);
    
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      console.log(`❌ Login [${requestId}]: CSRF validation failed`);
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json({
        error: 'CSRF validation failed',
        details: csrfValidation.error
      }, { status: 403 });
    }

    console.log(`✅ Login [${requestId}]: CSRF validation passed`);

    // Validazione input robusta
    const validation = validateInput(sanitizedBody, {
      email: VALIDATION_SCHEMAS.email,
      password: VALIDATION_SCHEMAS.required
    });

    if (!validation.valid) {
      console.log(`❌ Login [${requestId}]: Input validation failed:`, validation.errors);
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json({
        success: false,
        error: 'Dati di input non validi',
        details: validation.errors,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const { email, password } = sanitizedBody;

    console.log(`🔄 Login [${requestId}]: Attempting login for user:`, { email });

    // Test connessione Supabase prima del login
    try {
      console.log(`🔄 Login [${requestId}]: Testing Supabase connection...`);
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error(`❌ Login [${requestId}]: Supabase connection test failed:`, testError);
        return NextResponse.json({
          success: false,
          error: 'Errore di connessione al database. Riprova più tardi.',
          code: 'DATABASE_CONNECTION_ERROR',
          details: process.env.NODE_ENV === 'development' ? testError.message : undefined
        }, { status: 503 });
      }
      
      console.log(`✅ Login [${requestId}]: Supabase connection test passed`);
    } catch (connectionError) {
      console.error(`❌ Login [${requestId}]: Supabase connection error:`, connectionError);
      return NextResponse.json({
        success: false,
        error: 'Errore di connessione al database. Riprova più tardi.',
        code: 'DATABASE_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? connectionError.message : undefined
      }, { status: 503 });
    }

    // Autenticazione diretta con Supabase
    console.log(`🔄 Login [${requestId}]: Starting Supabase authentication...`);
    
    // Usa il wrapper sicuro per l'autenticazione
    const { data: authData, error: authError } = await safeAuthCall(
      async (client) => client.auth.signInWithPassword({ email, password }),
      null
    );

    if (authError) {
      console.error(`❌ Login [${requestId}]: Authentication error:`, authError);
      performanceMonitor.end('login_user', startTime);
      
      // Log dettagliato dell'errore
      console.error(`❌ Login [${requestId}]: Auth error details:`, {
        message: authError.message,
        status: authError.status,
        name: authError.name,
        stack: authError.stack
      });
      
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
      
      if (authError.message.includes('Too many requests')) {
        return NextResponse.json({
          success: false,
          error: 'Troppi tentativi di accesso. Riprova più tardi.',
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 });
      }
      
      if (authError.message.includes('Network error') || authError.message.includes('fetch failed') || authError.message.includes('TypeError: fetch failed')) {
        console.log(`⚠️ Login [${requestId}]: Network error detected:`, authError.message);
        return NextResponse.json({
          success: false,
          error: 'Errore di rete. Verifica la connessione e riprova.',
          code: 'NETWORK_ERROR'
        }, { status: 503 });
      }
      
      // Per tutti gli altri errori, restituisci un errore generico ma con dettagli in development
      return NextResponse.json({
        success: false,
        error: 'Errore durante l\'accesso. Riprova più tardi.',
        code: 'AUTH_ERROR',
        details: process.env.NODE_ENV === 'development' ? {
          message: authError.message,
          status: authError.status,
          name: authError.name
        } : undefined
      }, { status: 500 });
    }

    if (!authData?.user) {
      console.error(`❌ Login [${requestId}]: No user data returned`);
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json({
        success: false,
        error: 'Errore durante l\'autenticazione',
        code: 'AUTHENTICATION_FAILED'
      }, { status: 401 });
    }

    console.log(`✅ Login [${requestId}]: User authenticated successfully:`, authData.user.id);

    // Recupera profilo utente
    console.log(`🔍 Login [${requestId}]: Fetching user profile...`);
    let profileData = null;
    
    const { data: profile, error: profileError } = await safeDatabaseQuery(
      'profiles',
      async (client) => client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single(),
      null
    );

    if (profileError) {
      console.log(`⚠️ Login [${requestId}]: Profile not found:`, profileError);
    } else {
      console.log(`✅ Login [${requestId}]: Profile retrieved successfully`);
      profileData = profile;
    }

    // Recupera dati cliente se disponibili (semplificato)
    let clientData = null;
    console.log(`🔍 Login [${requestId}]: Fetching client data...`);
    
    const { data: client, error: clientError } = await safeDatabaseQuery(
      'clients',
      async (client) => client
        .from('clients')
        .select('*')
        .eq('user_id', authData.user.id)
        .single(),
      null
    );

    if (clientError) {
      console.error(`❌ Login [${requestId}]: Error retrieving client:`, clientError);
    } else {
      console.log(`✅ Login [${requestId}]: Client data retrieved successfully`);
      clientData = client;
    }

    // Genera nuovo CSRF token per la sessione
    const csrfToken = generateCSRFToken();
    console.log(`✅ Login [${requestId}]: New CSRF token generated`);

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
        profile: profileData ? {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          country: profileData.country,
          kyc_status: profileData.kyc_status
        } : null,
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
        'X-User-Role': userRole,
        'X-Request-ID': requestId
      }
    });

    // Set session cookies if available
    if (authData.session) {
      console.log(`🍪 Login [${requestId}]: Setting session cookies...`);
      
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

    console.log(`✅ Login [${requestId}]: Login process completed successfully`);
    performanceMonitor.end('login_user', startTime);
    return response;

  } catch (error) {
    console.error(`❌ Login [${requestId}]: Unexpected error:`, error);
    console.error(`❌ Login [${requestId}]: Error stack:`, error.stack);
    performanceMonitor.end('login_user', startTime);
    
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server. Riprova più tardi.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    }, { status: 500 });
  }
}); 