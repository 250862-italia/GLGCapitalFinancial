import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, password } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        role: 'user',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create client record
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: newUser.id,
        "firstName": first_name,
        "lastName": last_name,
        email: email.toLowerCase(),
        phone: phone,
        status: 'active',
        kyc_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      // If client creation fails, delete the user to maintain consistency
      await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id);
      
      return NextResponse.json(
        { error: 'Failed to create client record. Please try registering again.' },
        { status: 500 }
      );
    }

    console.log('✅ User and client created successfully:', {
      userId: newUser.id,
      clientId: newClient.id,
      email: email
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      client: {
        id: newClient.id,
        first_name: newClient.firstName,
        last_name: newClient.lastName,
        email: newClient.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 