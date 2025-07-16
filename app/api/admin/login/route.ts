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
      return NextResponse.json(
        { error: 'Invalid credentials. Please contact system administrator.' },
        { status: 401 }
      );
    }

    // Verifica che l'utente sia admin o superadmin
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Access denied: only admin/superadmin can access this area.' },
        { status: 403 }
      );
    }

    // Verifica che l'utente sia attivo
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact system administrator.' },
        { status: 403 }
      );
    }

    // Aggiorna last_login
    await supabaseAdmin
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Genera un token di sessione semplice
    const sessionToken = `admin_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`.trim() || user.email
      },
      session: {
        access_token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ore
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 