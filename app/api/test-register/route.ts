import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json()
    const { firstName, lastName, email, phone, password } = body

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        is_active: true
      })
      .select('id, email, first_name, last_name, role, is_active')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Error creating user account' },
        { status: 500 }
      )
    }

    // Create client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userData.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        status: 'active',
        kycStatus: 'pending'
      })
      .select('id')
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      // Try to delete the user if client creation fails
      await supabase.from('users').delete().eq('id', userData.id);
      return NextResponse.json(
        { error: 'Error creating client profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo',
      user_id: userData.id,
      client_id: clientData.id,
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        is_active: userData.is_active
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 