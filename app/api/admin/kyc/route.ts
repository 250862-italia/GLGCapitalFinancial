import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch all clients with KYC documents and financial/banking information
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
        kyc_documents,
        created_at,
        updated_at,
        -- Banking Information
        iban,
        bic,
        account_holder,
        usdt_wallet,
        -- Financial Information
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
        -- Investment Profile
        total_invested,
        risk_profile
      `)
      .not('kyc_documents', 'is', null)
      .not('kyc_documents', 'eq', '[]');

    if (clientsError) {
      console.error('Error fetching clients with KYC documents:', clientsError);
      return NextResponse.json(
        { error: 'Failed to fetch KYC documents' },
        { status: 500 }
      );
    }

    // Filter clients that actually have KYC documents
    const clientsWithKYC = clients?.filter(client => 
      client.kyc_documents && 
      Array.isArray(client.kyc_documents) && 
      client.kyc_documents.length > 0
    ) || [];

    return NextResponse.json({
      success: true,
      clients: clientsWithKYC,
      total: clientsWithKYC.length
    });

  } catch (error) {
    console.error('Error in admin KYC API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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