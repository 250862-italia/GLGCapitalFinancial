import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use Supabase only
    const { supabase } = await import('@/lib/supabase');

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
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
      user_id: user_id,
      company_name: '',
      tax_id: '',
      address: '',
      city: '',
      country: '',
      postal_code: ''
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('clients')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return NextResponse.json(
        { error: 'Failed to create profile', details: createError.message },
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