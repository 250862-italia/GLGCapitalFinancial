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
        console.log('✅ Login via Supabase Auth successful');
        authMethod = 'supabase_auth';
        
        // Get user data from our users table
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userData) {
          user = userData;
        } else {
          // Create user record if it doesn't exist
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              first_name: authData.user.user_metadata?.first_name || '',
              last_name: authData.user.user_metadata?.last_name || '',
              role: 'user',
              is_active: true,
              email_confirmed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!createError && newUser) {
            user = newUser;
          }
        }

        // Get client profile
        const { data: clientData, error: clientError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (clientData) {
          client = clientData;
        }
      }
    } catch (authError) {
      console.log('⚠️ Supabase Auth login failed, trying custom users table...');
    }

    // Method 2: Try custom users table if Supabase Auth failed
    if (!user) {
      console.log('🔄 Trying custom users table authentication...');
      
      // Hash the password to compare with stored hash
      const passwordHash = createHash('sha256').update(password).digest('hex');

      // Find user in our users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .eq('is_active', true)
        .single();

      if (!userError && userData) {
        console.log('✅ Login via custom users table successful');
        authMethod = 'custom_users';
        user = userData;

        // Get client profile
        const { data: clientData, error: clientError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (clientData) {
          client = clientData;
        }
      }
    }

    // If no user found with either method
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create a session-like response
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_confirmed: user.email_confirmed || true
      },
      client: client || null,
      access_token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refresh_token: `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      auth_method: authMethod
    };

    console.log(`🎉 Login successful via ${authMethod} for user: ${user.email}`);

    return NextResponse.json({ 
      success: true, 
      session: sessionData,
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 