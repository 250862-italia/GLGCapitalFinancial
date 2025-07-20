import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use Supabase admin client for better permissions
    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabase = getSupabaseAdmin();
    
    // Test connection first
    const { data: connectionTest, error: connectionError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Supabase connection failed:', connectionError);
      
      // Return a fallback profile when database is unavailable
      const fallbackProfile = {
        id: `fallback-${user_id}`,
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
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json(fallbackProfile, {
        headers: {
          'X-Profile-Status': 'fallback',
          'X-Profile-Warning': 'Database connection unavailable'
        }
      });
    }

    const { data: clientData, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Profile API error:', error);
    
    // Return a fallback profile for any unexpected errors
    const fallbackProfile = {
      id: `fallback-${params?.user_id || 'unknown'}`,
      user_id: params?.user_id || 'unknown',
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
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(fallbackProfile, {
      headers: {
        'X-Profile-Status': 'fallback',
        'X-Profile-Warning': 'Unexpected error occurred'
      }
    });
  }
} 