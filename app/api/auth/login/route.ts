import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let user = null;
    let client = null;
    let authMethod = '';

    // Method 1: Try Supabase Auth first
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!authError && authData.user) {
        console.log('✅ Login tramite Supabase Auth riuscito');
        authMethod = 'supabase_auth';
        
        // Get user data from custom users table
        const { data: dbUser, error: dbError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            first_name: dbUser.first_name,
            last_name: dbUser.last_name,
            email_confirmed: dbUser.email_confirmed || true // Default to true if undefined
          };
        } else {
          // If user doesn't exist in custom table, create it
          console.log('📝 Creazione record nella tabella users per utente Supabase Auth');
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              first_name: '',
              last_name: '',
              email_confirmed: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!createError && newUser) {
            user = {
              id: newUser.id,
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              email_confirmed: true
            };
          }
        }

        // Get client profile
        if (user) {
          const { data: clientData, error: clientError } = await supabaseAdmin
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!clientError && clientData) {
            client = clientData;
          }
        }

        return NextResponse.json({
          success: true,
          user,
          client,
          authMethod,
          access_token: authData.session?.access_token
        });
      }
    } catch (authError) {
      console.log('❌ Login Supabase Auth fallito, provo tabella users custom');
    }

    // Method 2: Try custom users table
    try {
      const passwordHash = createHash('sha256').update(password).digest('hex');
      
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (!dbError && dbUser) {
        console.log('✅ Login tramite tabella users custom riuscito');
        authMethod = 'custom_table';
        
        user = {
          id: dbUser.id,
          email: dbUser.email,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email_confirmed: dbUser.email_confirmed || true
        };

        // Get client profile
        const { data: clientData, error: clientError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!clientError && clientData) {
          client = clientData;
        }

        return NextResponse.json({
          success: true,
          user,
          client,
          authMethod
        });
      }
    } catch (customError) {
      console.log('❌ Login tabella users custom fallito');
    }

    // Both methods failed
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 