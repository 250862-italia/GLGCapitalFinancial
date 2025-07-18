import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
import { 
  supabaseQueryWithRetry, 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor,
  generateCacheKey
} from '@/lib/api-optimizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = performanceMonitor.start('login_user');
  
  try {
    const body = await request.json();
    
    // Sanitizzazione input
    const sanitizedBody = sanitizeInput(body);
    
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }

    // Validazione input robusta
    const validation = validateInput(sanitizedBody, {
      email: VALIDATION_SCHEMAS.email,
      password: VALIDATION_SCHEMAS.required
    });

    if (!validation.valid) {
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.errors },
        { status: 400 }
      );
    }

    const { email, password } = sanitizedBody;

    console.log('🔄 Login utente:', { email });

    // Query con retry logic per autenticazione
    const { data: authData, error: authError, cacheStatus } = await supabaseQueryWithRetry(
      () => supabase.auth.signInWithPassword({
        email,
        password
      }),
      {
        maxRetries: 3,
        timeout: 10000
      }
    );

    if (authError) {
      console.error('❌ Errore autenticazione:', authError);
      performanceMonitor.end('login_user', startTime);
      
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Credenziali non valide. Verifica email e password.' },
          { status: 401 }
        );
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Email non confermata. Controlla la tua casella email.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Errore durante l\'accesso. Riprova più tardi.' },
        { status: 500 }
      );
    }

    if (!authData?.user) {
      console.error('❌ Nessun utente autenticato');
      performanceMonitor.end('login_user', startTime);
      return NextResponse.json(
        { error: 'Errore durante l\'autenticazione' },
        { status: 500 }
      );
    }

    console.log('✅ Utente autenticato:', authData.user.id);

    // Recupera profilo utente con cache
    const cacheKey = generateCacheKey('user_profile', { userId: authData.user.id });
    
    const { data: profile, error: profileError } = await supabaseQueryWithRetry(
      () => supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single(),
      {
        maxRetries: 2,
        timeout: 8000,
        cacheKey,
        cacheTTL: 10 * 60 * 1000 // 10 minuti per i profili
      }
    );

    if (profileError) {
      console.error('❌ Errore recupero profilo:', profileError);
      // Non fallire se il profilo non può essere recuperato
      console.log('⚠️ Profilo non recuperato, ma utente autenticato');
    } else {
      console.log('✅ Profilo recuperato con successo');
    }

    // Recupera dati cliente se disponibili
    let clientData = null;
    if (profile) {
      const clientCacheKey = generateCacheKey('user_client', { userId: authData.user.id });
      
      const { data: client, error: clientError } = await supabaseQueryWithRetry(
        () => supabase
          .from('clients')
          .select('*')
          .eq('user_id', authData.user.id)
          .single(),
        {
          maxRetries: 2,
          timeout: 6000,
          cacheKey: clientCacheKey,
          cacheTTL: 5 * 60 * 1000 // 5 minuti per i clienti
        }
      );

      if (clientError) {
        console.error('❌ Errore recupero cliente:', clientError);
      } else {
        console.log('✅ Cliente recuperato con successo');
        clientData = client;
      }
    }

    // Genera nuovo CSRF token per la sessione
    const csrfToken = generateCSRFToken();

    // Prepara risposta ottimizzata
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || authData.user.user_metadata?.name || 'Utente',
        role: profile?.role || 'user',
        profile: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          country: profile.country,
          kyc_status: profile.kyc_status
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
      message: 'Accesso effettuato con successo',
      cacheStatus
    }, {
      headers: {
        'X-Performance': `${Date.now() - startTime}ms`,
        'X-Cache-Status': cacheStatus,
        'X-User-Role': profile?.role || 'user'
      }
    });

    performanceMonitor.end('login_user', startTime);
    return response;

  } catch (error) {
    console.error('❌ Errore generale login:', error);
    performanceMonitor.end('login_user', startTime);
    
    return NextResponse.json(
      { error: 'Errore interno del server. Riprova più tardi.' },
      { status: 500 }
    );
  }
} 