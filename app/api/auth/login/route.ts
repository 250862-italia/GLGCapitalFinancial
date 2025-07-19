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
  
  const body = await request.json();
  
  // Sanitizzazione input
  const sanitizedBody = sanitizeInput(body);
  
  // Validazione CSRF
  const csrfValidation = validateCSRFToken(request);
  if (!csrfValidation.valid) {
    performanceMonitor.end('login_user', startTime);
    throw new Error('CSRF token validation failed');
  }

  // Validazione input robusta
  const validation = validateInput(sanitizedBody, {
    email: VALIDATION_SCHEMAS.email,
    password: VALIDATION_SCHEMAS.required
  });

  if (!validation.valid) {
    performanceMonitor.end('login_user', startTime);
    throw new Error(`Invalid input data: ${validation.errors.join(', ')}`);
  }

    const { email, password } = sanitizedBody;

    console.log('🔄 Login utente:', { email });

    // Autenticazione diretta con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Errore autenticazione:', authError);
      performanceMonitor.end('login_user', startTime);
      
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('Credenziali non valide. Verifica email e password.');
      }
      
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('Email non confermata. Controlla la tua casella email.');
      }
      
      throw new Error('Errore durante l\'accesso. Riprova più tardi.');
    }

    if (!authData?.user) {
      console.error('❌ Nessun utente autenticato');
      performanceMonitor.end('login_user', startTime);
      throw new Error('Errore durante l\'autenticazione');
    }

    console.log('✅ Utente autenticato:', authData.user.id);

    // Recupera profilo utente (TEMPORANEAMENTE DISABILITATO per risolvere ricorsione)
    console.log('⚠️ Recupero profilo temporaneamente disabilitato per risolvere ricorsione infinita');
    
    // TODO: Riabilitare il recupero del profilo una volta risolta la ricorsione
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('id', authData.user.id)
    //   .single();

    // Recupera dati cliente se disponibili (semplificato)
    let clientData = null;
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (clientError) {
        console.error('❌ Errore recupero cliente:', clientError);
      } else {
        console.log('✅ Cliente recuperato con successo');
        clientData = client;
      }
    } catch (error) {
      console.error('❌ Errore generale recupero cliente:', error);
      console.log('⚠️ Cliente non recuperato, ma login continua');
    }

    // Genera nuovo CSRF token per la sessione
    const csrfToken = generateCSRFToken();

    // Prepara risposta ottimizzata
    const userName = authData.user.user_metadata?.name || 'Utente';
    const userRole = 'user';
    
    const response = NextResponse.json({
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
    }, {
      headers: {
        'X-Performance': `${Date.now() - startTime}ms`,
        'X-User-Role': userRole
      }
    });

    performanceMonitor.end('login_user', startTime);
    return response;

  }); 