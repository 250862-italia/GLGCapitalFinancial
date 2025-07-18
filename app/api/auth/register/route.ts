import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
import { 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor
} from '@/lib/api-optimizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = performanceMonitor.start('register_user');
  
  try {
    const body = await request.json();
    
    // Sanitizzazione input
    const sanitizedBody = sanitizeInput(body);
    
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      performanceMonitor.end('register_user', startTime);
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }

    // Validazione input robusta
    const validation = validateInput(sanitizedBody, {
      email: VALIDATION_SCHEMAS.email,
      password: VALIDATION_SCHEMAS.password,
      firstName: (value) => VALIDATION_SCHEMAS.string(value, 100),
      lastName: (value) => VALIDATION_SCHEMAS.string(value, 100),
      country: VALIDATION_SCHEMAS.required
    });

    if (!validation.valid) {
      performanceMonitor.end('register_user', startTime);
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.errors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, country } = sanitizedBody;
    const name = `${firstName} ${lastName}`.trim();

    console.log('🔄 Registrazione utente:', { email, firstName, lastName, country });

    // Creazione utente diretta con Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        country
      }
    });

    if (authError) {
      console.error('❌ Errore creazione utente auth:', authError);
      performanceMonitor.end('register_user', startTime);
      
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Un utente con questa email è già registrato' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova più tardi.' },
        { status: 500 }
      );
    }

    if (!authData?.user) {
      console.error('❌ Nessun utente creato');
      performanceMonitor.end('register_user', startTime);
      return NextResponse.json(
        { error: 'Errore durante la creazione dell\'utente' },
        { status: 500 }
      );
    }

    console.log('✅ Utente auth creato:', authData.user.id);

    // Crea profilo utente
    const profileData = {
      id: authData.user.id,
      name,
      email,
      role: 'user',
      first_name: firstName,
      last_name: lastName,
      country,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    let clientError = null;

    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError);
      // Non fallire se il profilo non può essere creato, l'utente può aggiornarlo dopo
      console.log('⚠️ Profilo non creato, ma utente registrato con successo');
    } else {
      console.log('✅ Profilo creato con successo');
      
      // Crea record cliente se il profilo è stato creato con successo
      const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const clientData = {
        user_id: authData.user.id,
        profile_id: authData.user.id,
        client_code: clientCode,
        status: 'active',
        risk_profile: 'moderate',
        investment_preferences: {},
        total_invested: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: clientInsertError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientInsertError) {
        console.error('❌ Errore creazione cliente:', clientInsertError);
        console.log('⚠️ Cliente non creato, ma utente e profilo registrati con successo');
        clientError = clientInsertError;
      } else {
        console.log('✅ Cliente creato con successo');
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
        name,
        role: 'user'
      },
      csrfToken,
      message: 'Registrazione completata con successo. Puoi ora accedere al tuo account.',
      profileCreated: !profileError,
      clientCreated: !profileError && !clientError
    }, {
      headers: {
        'X-Performance': `${Date.now() - startTime}ms`
      }
    });

    performanceMonitor.end('register_user', startTime);
    return response;

  } catch (error) {
    console.error('❌ Errore generale registrazione:', error);
    performanceMonitor.end('register_user', startTime);
    
    return NextResponse.json(
      { error: 'Errore interno del server. Riprova più tardi.' },
      { status: 500 }
    );
  }
} 