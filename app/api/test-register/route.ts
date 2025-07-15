import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

async function createClientProfile(userId: string, firstName: string, lastName: string, country: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to create client profile for user:`, userId);
      
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: userId,
          first_name: firstName || '',
          last_name: lastName || '',
          country: country || ''
        })
        .select()
        .single();

      if (clientError) {
        console.error(`Client creation error (attempt ${i + 1}):`, clientError);
        
        if (clientError.message.includes('foreign key constraint')) {
          if (i < retries - 1) {
            console.log('Foreign key constraint error, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          } else {
            throw new Error('User account was created but profile creation failed after multiple attempts. Please try logging in and updating your profile.');
          }
        }
        
        throw clientError;
      }

      console.log('Client profile created successfully:', client);
      return client;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, country } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Starting registration for:', email);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      );
    }

    // Create password hash
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // Create user in custom users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName || '',
        last_name: lastName || '',
        email_confirmed: true, // Auto-confirm email
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Errore nella creazione dell\'utente' },
        { status: 500 }
      );
    }

    console.log('User created successfully with ID:', user.id);

    // Create client profile with retry mechanism
    const client = await createClientProfile(user.id, firstName, lastName, country);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      client
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 