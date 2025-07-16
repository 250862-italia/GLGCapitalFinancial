import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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