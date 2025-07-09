import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get client profile
    let { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('"userId"', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile not found, create it automatically
      console.log('Profile not found, creating new profile for user:', userId);
      
      // Get user data from auth.users
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email, created_at')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return NextResponse.json(
          { error: 'Failed to fetch user data' },
          { status: 500 }
        );
      }

      // Create new client profile
      const newProfile = {
        user_id: userId,
        email: userData.email,
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: null,
        nationality: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        profile_photo: null,
        kyc_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('clients')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      data = createdProfile;
      console.log('Profile created successfully:', createdProfile);
    } else if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 