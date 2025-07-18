import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken } from '@/lib/csrf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gestione dei campi nome dal frontend
    const firstName = body.firstName || body.name?.split(' ')[0] || '';
    const lastName = body.lastName || body.name?.split(' ').slice(1).join(' ') || '';
    const fullName = body.name || `${firstName} ${lastName}`.trim();
    
    // Validazione input avanzata
    if (!body.email || !body.password || (!firstName && !body.name)) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validazione lunghezza password
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validazione complessità password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
        { status: 400 }
      );
    }

    // Validazione nome
    if (fullName.length < 2 || fullName.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Sanitizzazione input
    const email = body.email.trim().toLowerCase();
    const password = body.password;
    const name = fullName.trim();

    // Verifica se l'utente esiste già
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Crea nuovo utente
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Crea profilo utente
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name,
        email,
        role: 'user',
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Non fallire se il profilo non può essere creato, l'utente può aggiornarlo dopo
      console.log('⚠️ Profilo non creato, ma utente registrato con successo');
    } else {
      console.log('✅ Profilo creato con successo');
      
      // Crea record cliente se il profilo è stato creato con successo
      const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: data.user.id,
          profile_id: data.user.id,
          client_code: clientCode,
          status: 'active',
          risk_profile: 'moderate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (clientError) {
        console.error('Client creation error:', clientError);
        console.log('⚠️ Cliente non creato, ma utente e profilo registrati con successo');
      } else {
        console.log('✅ Cliente creato con successo, codice:', clientCode);
      }
    }

    // Genera CSRF token per la sessione
    const csrfToken = generateCSRFToken();

    // Prepara risposta
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'user'
      },
      csrfToken,
      message: 'Registration successful. You can now log in to your account.',
      profileCreated: !profileError,
      clientCreated: !profileError && !clientError
    });

    // Per ora non impostiamo cookie di sessione automaticamente
    // L'utente dovrà fare login separatamente dopo la registrazione

    return response;

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 