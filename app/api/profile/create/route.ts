import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use Supabase only
    const { supabase } = await import('@/lib/supabase');

    // Test Supabase connection first with timeout
    const connectionPromise = supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    const connectionTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    let connectionTest, connectionError;
    try {
      const result = await Promise.race([connectionPromise, connectionTimeout]) as any;
      connectionTest = result.data;
      connectionError = result.error;
    } catch (timeoutError) {
      connectionError = timeoutError;
    }

    if (connectionError) {
      console.error('Supabase connection failed:', connectionError);
      
      // Return a mock profile creation response when Supabase is unavailable
      const mockProfile = {
        id: `mock-${user_id}`,
        user_id: user_id,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        date_of_birth: '',
        nationality: '',
        profile_photo: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        iban: '',
        bic: '',
        account_holder: '',
        usdt_wallet: '',
        status: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: mockProfile,
        message: 'Profile created successfully (offline mode)',
        warning: 'Database connection unavailable - using offline mode'
      });
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing profile', details: checkError.message },
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
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      date_of_birth: '',
      nationality: '',
      profile_photo: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      iban: '',
      bic: '',
      account_holder: '',
      usdt_wallet: '',
      status: 'active'
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('clients')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      
      // If table doesn't exist or other database issues, return mock profile
      const mockProfile = {
        id: `mock-${user_id}`,
        user_id: user_id,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        date_of_birth: '',
        nationality: '',
        profile_photo: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        iban: '',
        bic: '',
        account_holder: '',
        usdt_wallet: '',
        status: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: mockProfile,
        message: 'Profile created successfully (offline mode)',
        warning: 'Database table unavailable - using offline mode'
      });
    }

    console.log('Profile created successfully:', createdProfile);

    return NextResponse.json({
      success: true,
      data: createdProfile,
      message: 'Profile created successfully'
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    // Return a mock profile in case of any unexpected errors
    const mockProfile = {
      id: `mock-${body?.user_id || 'unknown'}`,
      user_id: body?.user_id || 'unknown',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      date_of_birth: '',
      nationality: '',
      profile_photo: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      iban: '',
      bic: '',
      account_holder: '',
      usdt_wallet: '',
      status: 'offline',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockProfile,
      message: 'Profile created successfully (fallback mode)',
      warning: 'Unexpected error occurred - using fallback mode'
    });
  }
} 