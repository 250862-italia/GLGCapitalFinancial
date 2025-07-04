import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { emailNotificationService } from '../../../../lib/email-service'

export async function POST(request: NextRequest) {
  try {
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

    // Chiamata alla funzione SQL
    const { data, error } = await supabase.rpc('register_client', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      date_of_birth: dateOfBirth,
      nationality
    });

    if (error) {
      console.error('register_client error:', error)
      return NextResponse.json(
        { error: 'Errore durante la registrazione', details: error.message },
        { status: 500 }
      )
    }
    if (!data.success) {
      return NextResponse.json(
        { error: data.message, error_code: data.error_code },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      user_id: data.user_id,
      client_id: data.client_id
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 