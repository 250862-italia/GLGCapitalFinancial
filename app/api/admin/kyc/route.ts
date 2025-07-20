import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 KYC API called by admin:', authResult.user.id);

    // Fetch clients with their banking and financial information
    const { data: clients, error } = await supabase
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
        -- Investment data
        total_invested,
        risk_profile
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching KYC data:', error);
      return NextResponse.json({ error: 'Failed to fetch KYC data' }, { status: 500 });
    }

    // Transform data to include KYC status and additional information
    const kycData = clients?.map(client => ({
      id: client.id,
      user_id: client.user_id,
      user_email: client.email,
      user_name: `${client.first_name} ${client.last_name}`,
      status: client.status === 'active' ? 'approved' : 
              client.status === 'pending' ? 'pending' : 
              client.status === 'suspended' ? 'rejected' : 'under_review',
      document_type: 'profile_complete', // Since we're using profile data
      submitted_at: client.created_at,
      updated_at: client.updated_at,
      verification_level: 'enhanced',
      
      // Personal Information
      personal_info: {
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        date_of_birth: client.date_of_birth,
        nationality: client.nationality,
        address: client.address,
        city: client.city,
        country: client.country,
        postal_code: client.postal_code
      },

      // Banking Information
      banking_info: {
        iban: client.iban,
        bic: client.bic,
        account_holder: client.account_holder,
        usdt_wallet: client.usdt_wallet
      },

      // Financial Information
      financial_info: {
        annual_income: client.annual_income,
        net_worth: client.net_worth,
        investment_experience: client.investment_experience,
        risk_tolerance: client.risk_tolerance,
        monthly_investment_budget: client.monthly_investment_budget,
        emergency_fund: client.emergency_fund,
        debt_amount: client.debt_amount,
        credit_score: client.credit_score,
        employment_status: client.employment_status,
        employer_name: client.employer_name,
        job_title: client.job_title,
        years_employed: client.years_employed,
        source_of_funds: client.source_of_funds,
        tax_residency: client.tax_residency,
        tax_id: client.tax_id
      },

      // Investment Profile
      investment_profile: {
        total_invested: client.total_invested,
        risk_profile: client.risk_profile,
        investment_goals: client.investment_goals,
        preferred_investment_types: client.preferred_investment_types
      }
    })) || [];

    console.log(`✅ KYC data fetched successfully: ${kycData.length} clients`);

    return NextResponse.json({
      success: true,
      data: kycData
    });

  } catch (error) {
    console.error('❌ KYC API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, status, notes } = await request.json();

    if (!clientId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update client status
    const { error } = await supabase
      .from('clients')
      .update({ 
        status: status === 'approved' ? 'active' : 
                status === 'rejected' ? 'suspended' : 
                status === 'pending' ? 'pending' : 'under_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) {
      console.error('❌ Error updating KYC status:', error);
      return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 });
    }

    console.log(`✅ KYC status updated for client ${clientId}: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'KYC status updated successfully'
    });

  } catch (error) {
    console.error('❌ KYC update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 