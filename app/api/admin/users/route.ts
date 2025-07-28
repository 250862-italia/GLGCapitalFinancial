import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateCSRFToken } from '@/lib/csrf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    // Verifica autenticazione
    const token = request.cookies.get('sb-access-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verifica utente
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Ottieni lista utenti
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        role: user.user_metadata?.role || 'user'
      }))
    });

  } catch (error) {
    console.error('Users API error:', error);
    
    // Gestione errori di rete/connessione
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('TypeError: fetch failed'))) {
      console.log('⚠️ Users API: Network error detected:', error.message);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add other handlers (POST, PUT, DELETE) as needed, using only Supabase 