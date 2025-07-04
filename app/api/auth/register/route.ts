import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { emailNotificationService } from '../../../../lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      nationality
    } = body

    // Validation base
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      )
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        is_active: true,
        email_verified: false
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Errore durante la creazione utente', details: userError.message },
        { status: 500 }
      )
    }

    // Insert client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userData.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        date_of_birth: dateOfBirth,
        nationality,
        status: 'active'
      })
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      return NextResponse.json(
        { error: 'Errore durante la creazione cliente', details: clientError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo',
      user_id: userData.id,
      client_id: clientData.id
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 