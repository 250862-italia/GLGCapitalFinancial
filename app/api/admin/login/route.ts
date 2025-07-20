import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { validateCSRFToken } from '@/lib/csrf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Test Supabase connection first
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('Supabase unavailable, using fallback data');
      
      // Mock admin login for offline mode
      const mockAdmin = {
        id: `admin-mock-${Date.now()}`,
        email,
        first_name: 'Admin',
        last_name: 'Offline',
        role: 'superadmin',
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionToken = `admin_offline_session_${mockAdmin.id}_${Date.now()}`;

      return NextResponse.json({
        success: true,
        user: {
          id: mockAdmin.id,
          email: mockAdmin.email,
          first_name: mockAdmin.first_name,
          last_name: mockAdmin.last_name,
          role: mockAdmin.role,
          name: `${mockAdmin.first_name} ${mockAdmin.last_name}`.trim() || mockAdmin.email
        },
        session: {
          access_token: sessionToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        message: 'Login admin effettuato con successo (Modalità offline)',
        warning: 'Database non disponibile - modalità offline attiva'
      });
    }

    // Hash della password
    const passwordHash = createHash('sha256').update(password).digest('hex');
    
    // Cerca utente nella tabella profiles
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
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

    // Verifica che l'utente sia attivo (skip check if field doesn't exist)
    // if (!user.is_active) {
    //   return NextResponse.json(
    //     { error: 'Account is deactivated. Please contact system administrator.' },
    //     { status: 403 }
    //   );
    // }

    // Aggiorna last_login
    await supabaseAdmin
      .from('profiles')
      .update({ 
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