import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function createClientProfile(userId: string, firstName: string, lastName: string, country: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to create client profile for user:`, userId);
      
      const { data: client, error: clientError } = await supabase
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

    // Register user in Supabase
    const { data: user, error: registerError } = await supabase.auth.signUp({
      email,
      password
    });

    if (registerError) {
      console.error('User registration error:', registerError);
      return NextResponse.json(
        { error: registerError.message },
        { status: 500 }
      );
    }

    if (!user.user?.id) {
      console.error('No user ID returned from registration');
      return NextResponse.json(
        { error: 'User registration failed - no user ID returned' },
        { status: 500 }
      );
    }

    console.log('User registered successfully with ID:', user.user.id);

    // Wait a moment to ensure the user is fully created in auth.users
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create client profile with retry mechanism
    const client = await createClientProfile(user.user.id, firstName, lastName, country);

    return NextResponse.json({
      success: true,
      user: user.user,
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