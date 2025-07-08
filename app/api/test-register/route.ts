import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // LOG DIAGNOSTICO: Mostra le chiavi e URL usati dal backend
  console.log('🔑 SUPABASE_URL (env):', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('🔑 SUPABASE_ANON_KEY (env):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // Import diretto delle funzioni di config
  const { SUPABASE_CONFIG, getSupabaseUrl, getSupabaseAnonKey } = await import('@/lib/supabase-config');
  console.log('🔑 SUPABASE_URL (getSupabaseUrl()):', getSupabaseUrl());
  console.log('🔑 SUPABASE_ANON_KEY (getSupabaseAnonKey()):', getSupabaseAnonKey());
  console.log('🔑 SUPABASE_CONFIG.url:', SUPABASE_CONFIG.url);
  console.log('🔑 SUPABASE_CONFIG.anonKey:', SUPABASE_CONFIG.anonKey);

  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, password } = body;

    // Validazione base
    if (!first_name || !last_name || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Registra l'utente
    const result = await AuthService.register({
      email,
      password,
      name: `${first_name} ${last_name}`.trim(),
      first_name: first_name,
      last_name: last_name,
      terms_accepted: true,
      marketing_consent: false
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    // Aggiorna la tabella users con first_name e last_name
    if (result.user && result.user.id) {
      await supabase
        .from('users')
        .update({
          first_name: first_name,
          last_name: last_name
        })
        .eq('id', result.user.id);
    }

    // Crea profilo cliente se non esiste già
    let client = null;
    if (result.user && result.user.id) {
      // Verifica se già esiste
      const { data: existing, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', result.user.id)
        .single();
      if (!existing) {
        // Inserisci il nuovo client con i campi snake_case
        const { data: created, error: createError } = await supabase
          .from('clients')
          .insert({
            user_id: result.user.id,
            email,
            first_name: first_name,
            last_name: last_name,
            phone,
            date_of_birth: null,
            nationality: null,
            address: null,
            city: null,
            country: null,
            postal_code: null,
            profile_photo: null,
            banking_details: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        if (createError) {
          console.log('Client profile creation error:', createError);
          return NextResponse.json({ success: false, error: 'Errore creazione profilo cliente: ' + createError.message }, { status: 500 });
        }
        client = created;
      } else {
        client = existing;
      }
    } else {
      return NextResponse.json({ success: false, error: 'Errore: utente non creato correttamente.' }, { status: 500 });
    }

    // Subito dopo aver creato il client supabase
    console.log('🔑 SUPABASE_URL:', getSupabaseUrl());
    console.log('🔑 SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email,
        name: `${first_name} ${last_name}`.trim(),
        first_name: first_name,
        last_name: last_name
      },
      client
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    if (err.code === '42501' && err.message === 'new row violates row-level security policy for table "users"') {
      return NextResponse.json({ success: false, error: 'Row-level security policy violation.' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
} 