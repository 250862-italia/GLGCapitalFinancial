import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, name, phone } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name: name || '',
        phone: phone || '',
        role: role,
        status: 'active',
        email_verified: true
      }])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profileData.role,
        name: profileData.full_name,
        phone: profileData.phone,
        status: profileData.status
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
} 