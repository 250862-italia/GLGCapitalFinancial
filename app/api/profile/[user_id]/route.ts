import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

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
    
    // First, try to get the profile from profiles table
    console.log('🔍 Profile API: Fetching profile from profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.log('⚠️ Profile API: Profile not found in profiles table:', profileError.message);
    } else {
      console.log('✅ Profile API: Profile found in profiles table');
    }

    // Then, try to get the client data
    console.log('🔍 Profile API: Fetching client data...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (clientError) {
      console.log('⚠️ Profile API: Client not found in clients table:', clientError.message);
    } else {
      console.log('✅ Profile API: Client found in clients table');
    }

    // If we have profile data, use it as base
    if (profileData) {
      const combinedProfile = {
        // Profile data
        id: profileData.id,
        user_id: profileData.id, // Use profile id as user_id for compatibility
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        company: profileData.company || '',
        position: profileData.position || '',
        date_of_birth: profileData.date_of_birth || '',
        nationality: profileData.nationality || '',
        profile_photo: profileData.profile_photo || '',
        address: profileData.address || '',
        city: profileData.city || '',
        country: profileData.country || '',
        postal_code: profileData.postal_code || '',
        iban: profileData.iban || '',
        bic: profileData.bic || '',
        account_holder: profileData.account_holder || '',
        usdt_wallet: profileData.usdt_wallet || '',
        // Financial Information fields
        annual_income: profileData.annual_income || null,
        net_worth: profileData.net_worth || null,
        investment_experience: profileData.investment_experience || '',
        risk_tolerance: profileData.risk_tolerance || '',
        investment_goals: profileData.investment_goals || {},
        preferred_investment_types: profileData.preferred_investment_types || {},
        investment_preferences: profileData.investment_preferences || {},
        monthly_investment_budget: profileData.monthly_investment_budget || null,
        emergency_fund: profileData.emergency_fund || null,
        debt_amount: profileData.debt_amount || null,
        credit_score: profileData.credit_score || null,
        employment_status: profileData.employment_status || '',
        employer_name: profileData.employer_name || '',
        job_title: profileData.job_title || '',
        years_employed: profileData.years_employed || null,
        source_of_funds: profileData.source_of_funds || '',
        tax_residency: profileData.tax_residency || '',
        tax_id: profileData.tax_id || '',
        kyc_documents: profileData.kyc_documents || [],
        status: profileData.kyc_status || 'pending',
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString(),
        // Client data (if available)
        ...(clientData && {
          client_code: clientData.client_code,
          client_status: clientData.status,
          risk_profile: clientData.risk_profile,
          total_invested: clientData.total_invested,
          investment_count: clientData.investment_count,
          last_investment_date: clientData.last_investment_date,
          preferred_currencies: clientData.preferred_currencies,
          investment_history: clientData.investment_history,
          kyc_status: clientData.kyc_status,
          compliance_notes: clientData.compliance_notes,
          account_balance: clientData.account_balance,
          available_balance: clientData.available_balance,
          experience_level: clientData.experience_level,
          risk_level: clientData.risk_level,
          preferences: clientData.preferences,
          watchlist: clientData.watchlist,
          total_profit: clientData.total_profit,
          total_loss: clientData.total_loss,
          total_fees: clientData.total_fees,
          referral_count: clientData.referral_count,
          referral_code: clientData.referral_code,
          referral_earnings: clientData.referral_earnings,
          notifications_enabled: clientData.notifications_enabled,
          email_preferences: clientData.email_preferences,
          sms_preferences: clientData.sms_preferences,
          push_preferences: clientData.push_preferences,
          two_factor_enabled: clientData.two_factor_enabled,
          last_login: clientData.last_login,
          login_count: clientData.login_count,
          ip_address: clientData.ip_address,
          user_agent: clientData.user_agent,
          device_info: clientData.device_info,
          location_data: clientData.location_data,
          session_duration: clientData.session_duration
        })
      };

      return NextResponse.json(combinedProfile, {
        headers: {
          'X-Profile-Source': clientData ? 'profile+client' : 'profile-only',
          'X-Profile-Status': 'active'
        }
      });
    }

    // If no profile data, try to use client data as fallback
    if (clientData) {
      const clientProfile = {
        id: clientData.id,
        user_id: clientData.user_id,
        first_name: clientData.first_name || '',
        last_name: clientData.last_name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        company: clientData.company || '',
        position: clientData.position || '',
        date_of_birth: clientData.date_of_birth || '',
        nationality: clientData.nationality || '',
        profile_photo: clientData.profile_photo || '',
        address: clientData.address || '',
        city: clientData.city || '',
        country: clientData.country || '',
        postal_code: clientData.postal_code || '',
        iban: clientData.iban || '',
        bic: clientData.bic || '',
        account_holder: clientData.account_holder || '',
        usdt_wallet: clientData.usdt_wallet || '',
        // Client-specific fields
        client_code: clientData.client_code,
        status: clientData.status,
        risk_profile: clientData.risk_profile,
        total_invested: clientData.total_invested,
        investment_count: clientData.investment_count,
        last_investment_date: clientData.last_investment_date,
        preferred_currencies: clientData.preferred_currencies,
        investment_history: clientData.investment_history,
        kyc_status: clientData.kyc_status,
        compliance_notes: clientData.compliance_notes,
        account_balance: clientData.account_balance,
        available_balance: clientData.available_balance,
        experience_level: clientData.experience_level,
        risk_level: clientData.risk_level,
        preferences: clientData.preferences,
        watchlist: clientData.watchlist,
        total_profit: clientData.total_profit,
        total_loss: clientData.total_loss,
        total_fees: clientData.total_fees,
        referral_count: clientData.referral_count,
        referral_code: clientData.referral_code,
        referral_earnings: clientData.referral_earnings,
        notifications_enabled: clientData.notifications_enabled,
        email_preferences: clientData.email_preferences,
        sms_preferences: clientData.sms_preferences,
        push_preferences: clientData.push_preferences,
        two_factor_enabled: clientData.two_factor_enabled,
        last_login: clientData.last_login,
        login_count: clientData.login_count,
        ip_address: clientData.ip_address,
        user_agent: clientData.user_agent,
        device_info: clientData.device_info,
        location_data: clientData.location_data,
        session_duration: clientData.session_duration,
        created_at: clientData.created_at || new Date().toISOString(),
        updated_at: clientData.updated_at || new Date().toISOString()
      };

      return NextResponse.json(clientProfile, {
        headers: {
          'X-Profile-Source': 'client-only',
          'X-Profile-Status': 'active'
        }
      });
    }

    // If neither profile nor client data exists, return a basic profile structure
    console.log('⚠️ Profile API: No profile or client data found, returning basic structure');
    const basicProfile = {
      id: user_id,
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
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(basicProfile, {
      headers: {
        'X-Profile-Source': 'fallback',
        'X-Profile-Status': 'basic'
      }
    });

  } catch (error) {
    console.error('❌ Profile API error:', error);
    
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
      status: 'error',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(fallbackProfile, {
      headers: {
        'X-Profile-Source': 'error-fallback',
        'X-Profile-Status': 'error'
      }
    });
  }
} 