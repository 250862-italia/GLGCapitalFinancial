import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken, protectCSRFToken } from '@/lib/csrf';
import { 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor
} from '@/lib/api-optimizer';
import { safeAuthCall, safeDatabaseQuery } from '@/lib/supabase-safe';
import { withErrorHandling, generateRequestId, addRequestId } from '@/lib/error-handler';
import { offlineDataManager } from '@/lib/offline-data';
import { testSupabaseConnection } from '@/lib/supabase-fallback';

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

    // Prima controlla se l'utente esiste offline
    const offlineUser = offlineDataManager.findOfflineUser(email);
    if (offlineUser) {
      console.log(`🔄 Login [${requestId}]: Found offline user, attempting offline login`);
      
      // Verifica credenziali offline usando il manager
      if (offlineDataManager.validateOfflineCredentials(email, password)) {
        console.log(`✅ Login [${requestId}]: Offline login successful`);
        
        const offlineProfile = offlineDataManager.findOfflineProfile(offlineUser.id);
        const offlineClient = offlineDataManager.findOfflineClient(offlineUser.id);
        
        // Genera nuovo CSRF token per la sessione
        const csrfToken = generateCSRFToken();
        
        const responseData = {
          success: true,
          user: {
            id: offlineUser.id,
            email: offlineUser.email,
            name: offlineProfile?.name || `${offlineProfile?.first_name} ${offlineProfile?.last_name}`,
            role: 'user',
            profile: offlineProfile ? {
              first_name: offlineProfile.first_name,
              last_name: offlineProfile.last_name,
              country: offlineProfile.country,
              kyc_status: offlineProfile.kyc_status || 'pending'
            } : null,
            client: offlineClient ? {
              client_code: offlineClient.client_code,
              status: offlineClient.status,
              risk_profile: offlineClient.risk_profile || 'standard',
              total_invested: offlineClient.total_invested || 0
            } : null
          },
          session: {
            access_token: `offline_${Date.now()}`,
            refresh_token: `offline_refresh_${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          csrfToken,
          message: 'Accesso effettuato con successo (modalità offline)',
          mode: 'offline'
        };

        performanceMonitor.end('login_user', startTime);
        return NextResponse.json(responseData, {
          headers: {
            'X-Performance': `${Date.now() - startTime}ms`,
            'X-Mode': 'offline'
          }
        });
      } else {
        console.log(`❌ Login [${requestId}]: Invalid offline credentials`);
        performanceMonitor.end('login_user', startTime);
        return NextResponse.json({
          success: false,
          error: 'Credenziali non valide. Verifica email e password.',
          code: 'INVALID_CREDENTIALS'
        }, { status: 401 });
      }
    }

    // Test connessione Supabase usando il sistema di fallback
    console.log(`🔄 Login [${requestId}]: Testing Supabase connection...`);
    const isSupabaseConnected = await testSupabaseConnection();
    
    if (!isSupabaseConnected) {
      console.log(`❌ Login [${requestId}]: Supabase not available, user not found offline`);
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json({
        success: false,
        error: 'Utente non trovato. Verifica le credenziali o registrati.',
        code: 'USER_NOT_FOUND',
        details: 'Database non disponibile e utente non registrato offline'
      }, { status: 404 });
    }
    
    console.log(`✅ Login [${requestId}]: Supabase connection test passed`);

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
        }, { status: 401 });
      }
      
      if (authError.message.includes('Too many requests')) {
        return NextResponse.json({
          success: false,
          error: 'Troppi tentativi di accesso. Riprova più tardi.',
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 });
      }
      
      // Errore generico di autenticazione
      return NextResponse.json({
        success: false,
        error: 'Errore durante l\'autenticazione. Riprova più tardi.',
        code: 'AUTHENTICATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      }, { status: 500 });
    }

    if (!authData?.user) {
      console.log(`❌ Login [${requestId}]: No user data returned from Supabase`);
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json({
        success: false,
        error: 'Errore durante l\'autenticazione. Riprova più tardi.',
        code: 'NO_USER_DATA'
      }, { status: 500 });
    }

    console.log(`✅ Login [${requestId}]: Supabase authentication successful for user:`, authData.user.id);

    // Ottieni profilo utente
    const { data: profileData, error: profileError } = await safeDatabaseQuery(
      'profiles',
      (client) => client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single(),
      null
    );

    if (profileError) {
      console.error(`❌ Login [${requestId}]: Error fetching profile:`, profileError);
      // Non bloccare il login se il profilo non esiste
    }

    // Ottieni dati cliente se esiste
    const { data: clientData, error: clientError } = await safeDatabaseQuery(
      'clients',
      (client) => client
        .from('clients')
        .select('*')
        .eq('user_id', authData.user.id)
        .single(),
      null
    );

    if (clientError) {
      console.error(`❌ Login [${requestId}]: Error fetching client data:`, clientError);
      // Non bloccare il login se i dati cliente non esistono
    }

    // Genera nuovo CSRF token per la sessione
    const csrfToken = generateCSRFToken();

    const responseData = {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: profileData?.name || `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || authData.user.email,
        role: profileData?.role || 'user',
        profile: profileData ? {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          country: profileData.country,
          kyc_status: profileData.kyc_status || 'pending'
        } : null,
        client: clientData ? {
          client_code: clientData.client_code,
          status: clientData.status,
          risk_profile: clientData.risk_profile || 'standard',
          total_invested: clientData.total_invested || 0
        } : null
      },
      session: {
        access_token: authData.session?.access_token || `online_${Date.now()}`,
        refresh_token: authData.session?.refresh_token || `online_refresh_${Date.now()}`,
        expires_at: authData.session?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      csrfToken,
      message: 'Accesso effettuato con successo',
      mode: 'online'
    };

    console.log(`✅ Login [${requestId}]: Login successful, returning user data`);
    performanceMonitor.end('login_user', startTime);

    return NextResponse.json(responseData, {
      headers: {
        'X-Performance': `${Date.now() - startTime}ms`,
        'X-Mode': 'online'
      }
    });

  } catch (error: any) {
    console.error(`❌ Login [${requestId}]: Unexpected error:`, error);
    performanceMonitor.end('login_user', startTime);
    
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server. Riprova più tardi.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}); 