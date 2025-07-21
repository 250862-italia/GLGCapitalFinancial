import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [KYC API] Starting KYC data fetch...');
    
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      console.log('❌ [KYC API] Admin authentication failed:', authResult.error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('✅ [KYC API] Admin authentication successful');

    const supabase = getSupabaseAdmin();
    console.log('✅ [KYC API] Supabase admin client obtained');

    // First, let's get all clients to see what data we have
    console.log('📊 [KYC API] Fetching all clients...');
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (allClientsError) {
      console.error('❌ [KYC API] Error fetching all clients:', allClientsError);
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: allClientsError.message },
        { status: 500 }
      );
    }

    console.log('✅ [KYC API] All clients fetched:', allClients?.length || 0);
    if (allClients && allClients.length > 0) {
      console.log('📋 [KYC API] Available columns:', Object.keys(allClients[0]));
    }

    // Now fetch all clients with their data (without kyc_documents filter for now)
    console.log('📊 [KYC API] Fetching clients with financial data...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        nationality,
        address,
        city,
        country,
        postal_code,
        status,
        created_at,
        updated_at,
        iban,
        bic,
        account_holder,
        usdt_wallet,
        annual_income,
        net_worth,
        investment_experience,
        risk_tolerance,
        investment_goals,
        preferred_investment_types,
        monthly_investment_budget,
        emergency_fund,
        debt_amount,
        credit_score,
        employment_status,
        employer_name,
        job_title,
        years_employed,
        source_of_funds,
        tax_residency,
        tax_id,
        total_invested,
        risk_profile
      `);

    if (clientsError) {
      console.error('❌ [KYC API] Error fetching clients with financial data:', clientsError);
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: clientsError.message },
        { status: 500 }
      );
    }

    console.log('✅ [KYC API] Clients with financial data fetched:', clients?.length || 0);

    // For now, return all clients (we'll add KYC document filtering later)
    const clientsWithData = clients || [];

    console.log('✅ [KYC API] Returning clients with data:', clientsWithData.length);

    return NextResponse.json({
      success: true,
      clients: clientsWithData,
      total: clientsWithData.length,
      note: 'KYC documents will be added when the column is available'
    });

  } catch (error) {
    console.error('❌ [KYC API] Error in admin KYC API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, status, notes } = await request.json();

    if (!clientId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update client status
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('clients')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select();

    if (error) {
      console.error('Error updating client status:', error);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('KYC update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 