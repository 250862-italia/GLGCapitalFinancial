import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { notifyClientRegister } from '@/lib/client-notification-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, company, password } = body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, cognome, email e password sono richiesti' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato email non valido' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Try to save to Supabase first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          return NextResponse.json(
            { message: 'Un utente con questa email esiste già' },
            { status: 409 }
          );
        }

        // Create new user in Supabase
        const { data: newUser, error } = await supabase
          .from('profiles')
          .insert([
            {
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone || '',
              company: company || '',
              password_hash: hashedPassword,
              status: 'pending_verification',
              role: 'client'
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error('Database error');
        }

        console.log('User registered in Supabase:', { ...newUser, password_hash: '[HIDDEN]' });

        // Invia notifica all'admin
        try {
          await notifyClientRegister(
            newUser.id,
            newUser.email,
            `${newUser.first_name} ${newUser.last_name}`
          );
        } catch (notifError) {
          console.log('Errore notifica admin (non critico):', notifError);
        }

        return NextResponse.json({
          success: true,
          message: 'Registrazione effettuata con successo',
          user: {
            id: newUser.id,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            email: newUser.email,
            phone: newUser.phone,
            company: newUser.company,
            status: newUser.status
          }
        });

      } catch (supabaseError) {
        console.log('Supabase error, using fallback:', supabaseError);
      }
    }

    // Fallback: simulate user creation if Supabase is not available
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone: phone || '',
      company: company || '',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      status: 'pending_verification'
    };

    console.log('User registered (fallback):', { ...user, password: '[HIDDEN]' });

    // Invia notifica all'admin
    try {
      await notifyClientRegister(
        user.id,
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (notifError) {
      console.log('Errore notifica admin (non critico):', notifError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registrazione effettuata con successo (modalità test)',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
