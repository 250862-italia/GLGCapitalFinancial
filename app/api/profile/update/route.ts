import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update client profile
    // Mappa i campi updates da camelCase a snake_case se necessario
    const updatesTyped: Record<string, any> = updates as Record<string, any>;
    const updatesSnakeCase: Record<string, any> = {};
    for (const key in updatesTyped) {
      if (Object.prototype.hasOwnProperty.call(updatesTyped, key)) {
        // Conversione base camelCase -> snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updatesSnakeCase[snakeKey] = updatesTyped[key];
      }
    }
    const { data, error } = await supabase
      .from('clients')
      .update(updatesSnakeCase)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

 