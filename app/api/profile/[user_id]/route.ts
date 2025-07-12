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

    // Use local database if enabled
    if (process.env.USE_LOCAL_DATABASE === 'true') {
      const { getLocalDatabase } = await import('@/lib/local-database');
      const db = await getLocalDatabase();
      
      try {
        // Get client profile from local database
        const localClientData = await db.getClientByUserId(user_id);
        
        if (localClientData) {
          // Convert local database format to ClientProfile format
          const clientData = {
            id: localClientData.id,
            user_id: localClientData.user_id,
            email: '', // Will be filled from user data
            first_name: '', // Will be filled from user data
            last_name: '', // Will be filled from user data
            phone: '', // Will be filled from user data
            company: localClientData.company_name || '',
            position: '',
            date_of_birth: '',
            nationality: '',
            photo_url: '',
            tax_id: localClientData.tax_id || '',
            address: localClientData.address || '',
            city: localClientData.city || '',
            country: localClientData.country || '',
            postal_code: localClientData.postal_code || '',
            iban: '',
            bic: '',
            account_holder: '',
            usdt_wallet: '',
            status: 'ACTIVE',
            created_at: localClientData.created_at,
            updated_at: localClientData.updated_at
          };
          
          return NextResponse.json(clientData);
        } else {
          return NextResponse.json(
            { error: 'Profile not found' },
            { status: 404 }
          );
        }
      } catch (dbError) {
        console.error('Local database error:', dbError);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    } else {
      // Use Supabase
      const { supabase } = await import('@/lib/supabase');
      
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
          { error: 'Database error' },
          { status: 500 }
        );
      }

      return NextResponse.json(clientData);
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 