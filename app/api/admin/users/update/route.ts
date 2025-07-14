import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, phone, role, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update profile in profiles table
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.full_name = name;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        name: data.full_name,
        phone: data.phone,
        status: data.status
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
} 