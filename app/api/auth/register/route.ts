import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { supabaseEmailService } from '@/lib/supabase-email-service';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, country } = body;

    // Validazione
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      );
    }

    // Verifica se l'utente esiste già
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un account con questa email esiste già' },
        { status: 409 }
      );
    }

    // Genera ID utente
    const userId = crypto.randomUUID();

    // Hash della password
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // Crea utente nella tabella users
    const { data: newUser, error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        password_hash: passwordHash,
        is_active: true,
        email_confirmed: false, // Ora sarà confermato via email
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userInsertError) {
      console.error('Error creating user:', userInsertError);
      return NextResponse.json(
        { error: 'Errore nella creazione dell\'account' },
        { status: 500 }
      );
    }

    console.log('User created successfully with ID:', userId);

    // Crea profilo cliente
    const client = await createClientProfile(userId, firstName, lastName, country);

    // Invia email di conferma usando Supabase Auth
    const emailResult = await supabaseEmailService.sendEmail({
      to: email,
      subject: 'Welcome to GLG Capital Group - Confirm Your Email',
      template: 'confirm-signup',
      data: {
        firstName,
        lastName,
        country
      }
    });

    if (!emailResult.success) {
      console.warn('⚠️ Email confirmation failed:', emailResult.message);
      // Continua comunque, l'utente può richiedere un nuovo link
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      client,
      emailSent: emailResult.success,
      message: 'Registrazione completata! Controlla la tua email per confermare l\'account.'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

async function createClientProfile(userId: string, firstName: string, lastName: string, country: string) {
  try {
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        country: country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client profile:', clientError);
      return null;
    }

    return client;
  } catch (error) {
    console.error('Error in createClientProfile:', error);
    return null;
  }
} 