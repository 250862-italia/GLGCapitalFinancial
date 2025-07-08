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

    // Create new client profile with basic data
    const newProfile = {
      user_id: userId,
      email: '', // Will be filled by the client
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
      status: 'ACTIVE',
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
      
      // If the error is due to missing columns, try with minimal data
      if (createError.code === '42703' || createError.message.includes('column')) {
        const minimalProfile = {
          user_id: userId,
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          kyc_status: 'PENDING',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: minimalCreatedProfile, error: minimalCreateError } = await supabase
          .from('clients')
          .insert(minimalProfile)
          .select()
          .single();

        if (minimalCreateError) {
          console.error('Error creating minimal profile:', minimalCreateError);
          return NextResponse.json(
            { error: 'Failed to create profile - database schema issue' },
            { status: 500 }
          );
        }

        console.log('Minimal profile created successfully:', minimalCreatedProfile);
        return NextResponse.json({
          success: true,
          data: minimalCreatedProfile,
          message: 'Minimal profile created successfully'
        });
      }

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