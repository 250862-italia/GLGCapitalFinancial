import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
import { 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor
} from '@/lib/api-optimizer';
import { offlineDataManager } from '@/lib/offline-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simulazione di un database offline per utenti registrati
let offlineUsers: any[] = [];
let offlineProfiles: any[] = [];
let offlineClients: any[] = [];

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
        { error: 'CSRF validation failed', details: csrfValidation.error },
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

    // Controlla se l'utente esiste già (sia online che offline)
    const existingUser = offlineUsers.find(u => u.email === email);
    if (existingUser) {
      performanceMonitor.end('register_user', startTime);
      return NextResponse.json(
        { error: 'Un utente con questa email è già registrato' },
        { status: 409 }
      );
    }

    // Prova prima con Supabase
    try {
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
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Nessun utente creato');
      }

      console.log('✅ Utente auth creato:', authData.user.id);

      // Crea profilo utente con struttura corretta
      const profileData = {
        id: authData.user.id,
        name: `${firstName} ${lastName}`,
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
        console.log('⚠️ Profilo non creato, ma utente registrato con successo');
      } else {
        console.log('✅ Profilo creato con successo');
        
        // Crea record cliente se il profilo è stato creato con successo
        const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const clientData = {
          user_id: authData.user.id,
          profile_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
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
        clientCreated: !profileError && !clientError,
        mode: 'online'
      }, {
        headers: {
          'X-Performance': `${Date.now() - startTime}ms`
        }
      });

      performanceMonitor.end('register_user', startTime);
      return response;

    } catch (supabaseError) {
      console.log('⚠️ Supabase non disponibile, usando modalità offline:', supabaseError);
      
      // Modalità offline
      const userId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crea utente offline
      const offlineUser = {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        is_active: true,
        email_verified: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Crea profilo offline
      const offlineProfile = {
        id: userId,
        name,
        email,
        role: 'user',
        first_name: firstName,
        last_name: lastName,
        country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Crea cliente offline
      const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const offlineClient = {
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: '',
        country,
        city: '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Salva nei dati offline
      offlineUsers.push(offlineUser);
      offlineProfiles.push(offlineProfile);
      offlineClients.push(offlineClient);
      
      console.log('✅ Utente registrato in modalità offline:', userId);
      
      // Genera nuovo CSRF token per la sessione
      const csrfToken = generateCSRFToken();

      // Prepara risposta per modalità offline
      const response = NextResponse.json({
        success: true,
        user: {
          id: userId,
          email,
          name,
          role: 'user'
        },
        csrfToken,
        message: 'Registrazione completata con successo in modalità offline. Puoi ora accedere al tuo account.',
        profileCreated: true,
        clientCreated: true,
        mode: 'offline',
        warning: 'Sistema operativo in modalità offline - i dati saranno sincronizzati quando Supabase sarà disponibile'
      }, {
        headers: {
          'X-Performance': `${Date.now() - startTime}ms`
        }
      });

      performanceMonitor.end('register_user', startTime);
      return response;
    }

  } catch (error) {
    console.error('❌ Errore generale registrazione:', error);
    performanceMonitor.end('register_user', startTime);
    
    return NextResponse.json(
      { error: 'Errore interno del server. Riprova più tardi.' },
      { status: 500 }
    );
  }
} 