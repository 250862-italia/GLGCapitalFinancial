import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

    // Register user in Supabase
    const { data: user, error: registerError } = await supabase.auth.signUp({
      email,
      password
    });

    if (registerError) {
      return NextResponse.json(
        { error: registerError.message },
        { status: 500 }
      );
    }

    // Create client profile in Supabase
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: user.user?.id,
        first_name: firstName || '',
        last_name: lastName || '',
        country: country || ''
      })
      .select()
      .single();

    if (clientError) {
      return NextResponse.json(
        { error: clientError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user.user,
      client
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 