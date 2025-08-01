import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
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
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
);

export async function POST(request: NextRequest) {
  console.log('🔄 Login: Starting login process...');
  
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔄 Login: Attempting login for user:', { email });

    // Validazione input semplice
    if (!email || !password) {
      console.log('❌ Login: Missing email or password');
      return NextResponse.json({
        success: false,
        error: 'Email e password sono richiesti',
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 });
    }

    // Validazione email semplice
    if (!email.includes('@')) {
      console.log('❌ Login: Invalid email format');
      return NextResponse.json({
        success: false,
        error: 'Formato email non valido',
        code: 'INVALID_EMAIL'
      }, { status: 400 });
    }

    // Prima controlla se l'utente esiste offline
    const offlineUser = offlineDataManager.findOfflineUser(email);
    if (offlineUser) {
      console.log('🔄 Login: Found offline user, attempting offline login');
      
      // Verifica credenziali offline usando il manager
      if (offlineDataManager.validateOfflineCredentials(email, password)) {
        console.log('✅ Login: Offline login successful');
        
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

        return NextResponse.json(responseData);
      } else {
        console.log('❌ Login: Invalid offline credentials');
        return NextResponse.json({
          success: false,
          error: 'Credenziali non valide. Verifica email e password.',
          code: 'INVALID_CREDENTIALS'
        }, { status: 401 });
      }
    }

    // Test connessione Supabase usando il sistema di fallback
    console.log('🔄 Login: Testing Supabase connection...');
    const isSupabaseConnected = await testSupabaseConnection();
    
    if (!isSupabaseConnected) {
      console.log('❌ Login: Supabase not available, user not found offline');
      return NextResponse.json({
        success: false,
        error: 'Utente non trovato. Verifica le credenziali o registrati.',
        code: 'USER_NOT_FOUND',
        details: 'Database non disponibile e utente non registrato offline'
      }, { status: 404 });
    }
    
    console.log('✅ Login: Supabase connection test passed');

    // Autenticazione diretta con Supabase
    console.log('🔄 Login: Starting Supabase authentication...');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) {
        console.error('❌ Login: Authentication error:', authError);
        
        // Restituisci errori di autenticazione appropriati
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
        console.log('❌ Login: No user data returned from Supabase');
        return NextResponse.json({
          success: false,
          error: 'Errore durante l\'autenticazione. Riprova più tardi.',
          code: 'NO_USER_DATA'
        }, { status: 500 });
      }

      console.log('✅ Login: Supabase authentication successful for user:', authData.user.id);

      // Ottieni profilo utente
      let profileData = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!profileError) {
          profileData = profile;
        }
      } catch (error) {
        console.error('❌ Login: Error fetching profile:', error);
      }

      // Ottieni dati cliente se esiste
      let clientData = null;
      try {
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (!clientError) {
          clientData = client;
        }
      } catch (error) {
        console.error('❌ Login: Error fetching client data:', error);
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

      console.log('✅ Login: Login successful, returning user data');
      return NextResponse.json(responseData);

    } catch (supabaseError) {
      console.error('❌ Login: Supabase operation error:', supabaseError);
      return NextResponse.json({
        success: false,
        error: 'Errore di connessione al database. Riprova più tardi.',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? supabaseError : undefined
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Login: Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server. Riprova più tardi.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 