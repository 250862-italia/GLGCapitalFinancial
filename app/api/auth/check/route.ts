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
  
  // Validazione CSRF
  const csrfValidation = validateCSRFToken(request);
  if (!csrfValidation.valid) {
    return NextResponse.json({
      error: 'CSRF validation failed',
      details: csrfValidation.error
    }, { status: 403 });
  }

  try {
    // Ottieni la sessione corrente
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Errore recupero sessione:', error);
      return NextResponse.json({
        authenticated: false,
        error: 'Errore durante il controllo della sessione'
      }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    // Recupera dati cliente se disponibili
    let clientData = null;
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!clientError && client) {
        clientData = client;
      }
    } catch (error) {
      console.error('❌ Errore recupero cliente:', error);
    }

    // Prepara risposta
    const userName = session.user.user_metadata?.name || 'Utente';
    const userRole = 'user';
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: userName,
        role: userRole,
        client: clientData ? {
          client_code: clientData.client_code,
          status: clientData.status,
          risk_profile: clientData.risk_profile,
          total_invested: clientData.total_invested
        } : null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Errore generale check auth:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Errore durante il controllo dell\'autenticazione'
    }, { status: 500 });
  }
}); 