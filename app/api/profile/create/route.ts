import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('"userId"', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing profile' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        data: existingProfile,
        message: 'Profile already exists'
      });
    }

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
      userId: userId,
      email: userData.email,
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: null,
      nationality: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      profilePhoto: null,
      kycStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

    console.log('Profile created successfully:', createdProfile);

    return NextResponse.json({
      success: true,
      data: createdProfile,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 