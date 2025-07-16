import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';
import { InputSanitizer } from '@/lib/input-sanitizer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sanitize and validate input data
    let sanitizedData;
    try {
      sanitizedData = InputSanitizer.sanitizeLoginData(body);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    const { email, password } = sanitizedData;

    // Test Supabase connection first
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('Supabase unavailable, using offline mode');
      
      // Mock login for offline mode
      const mockUser = {
        id: `mock-${Date.now()}`,
        email,
        first_name: 'Offline',
        last_name: 'User',
        role: 'user',
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionToken = `offline_session_${mockUser.id}_${Date.now()}`;

      return NextResponse.json({
        user: mockUser,
        access_token: sessionToken,
        message: 'Login successful (Offline mode)',
        warning: 'Database not available - offline mode active'
      });
    }

    // Hash della password
    const passwordHash = createHash('sha256').update(password).digest('hex');
    
    // Cerca utente nella tabella users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (userError || !user) {
      console.log('❌ Login fallito: utente non trovato o password errata');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.is_active) {
      console.log('❌ Login fallito: utente non attivo');
      return NextResponse.json({ error: 'Account is not active' }, { status: 401 });
    }

    // Crea token di sessione (semplice per ora)
    const sessionToken = `session_${user.id}_${Date.now()}`;
    
    // Crea risposta con dati utente
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified
    };

    console.log('✅ Login tramite tabella users custom riuscito');

    return NextResponse.json({
      user: userData,
      access_token: sessionToken,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('❌ Errore durante il login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 