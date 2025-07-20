const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testKYCApi() {
  try {
    console.log('🧪 Testing KYC API functionality...');

    // 1. Check if clients table has all required columns
    console.log('🔍 Checking clients table structure...');
    
    const { data: testClient, error: testError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Error accessing clients table:', testError.message);
      return;
    }

    if (testClient.length > 0) {
      const client = testClient[0];
      console.log('✅ Clients table is accessible');
      console.log('📋 Available columns:', Object.keys(client));
      
      // Check for KYC-specific columns
      const kycColumns = [
        'annual_income', 'net_worth', 'investment_experience', 'risk_tolerance',
        'investment_goals', 'preferred_investment_types', 'monthly_investment_budget',
        'emergency_fund', 'debt_amount', 'credit_score', 'employment_status',
        'employer_name', 'job_title', 'years_employed', 'source_of_funds',
        'tax_residency', 'tax_id', 'risk_profile'
      ];

      const missingColumns = kycColumns.filter(col => !(col in client));
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing KYC columns:', missingColumns);
        console.log('📝 Please run the add-kyc-columns.sql script in Supabase SQL Editor');
      } else {
        console.log('✅ All KYC columns exist');
      }
    } else {
      console.log('⚠️ No clients found in database');
    }

    // 2. Test the KYC API query directly
    console.log('\n🔍 Testing KYC query directly...');
    
    try {
      const { data: kycData, error: kycError } = await supabase
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
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (kycError) {
        console.log('❌ KYC query error:', kycError.message);
        
        // Try with fewer columns to identify the problematic one
        console.log('🔍 Testing with basic columns only...');
        const { data: basicData, error: basicError } = await supabase
          .from('clients')
          .select('id, user_id, first_name, last_name, email, status')
          .limit(1);
        
        if (basicError) {
          console.log('❌ Even basic query fails:', basicError.message);
        } else {
          console.log('✅ Basic query works, some KYC columns are missing');
        }
      } else {
        console.log('✅ KYC query successful');
        console.log(`📊 Found ${kycData.length} clients with KYC data`);
        
        if (kycData.length > 0) {
          console.log('📋 Sample KYC data structure:', Object.keys(kycData[0]));
        }
      }
    } catch (queryError) {
      console.log('❌ Query execution error:', queryError.message);
    }

    // 3. Check if there are any clients with KYC data
    console.log('\n📊 Checking clients with KYC information...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email, status, investment_experience, risk_tolerance')
      .limit(10);

    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`📊 Found ${clients.length} clients`);
      
      if (clients.length > 0) {
        console.log('👥 Sample clients:');
        clients.forEach((client, index) => {
          console.log(`  ${index + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
          console.log(`     Status: ${client.status}, Experience: ${client.investment_experience || 'N/A'}, Risk: ${client.risk_tolerance || 'N/A'}`);
        });
      }
    }

    // 4. Test admin authentication (simulate)
    console.log('\n🔐 Testing admin authentication simulation...');
    
    // Create a mock admin session
    const mockAdminSession = `admin_95971e18-ff4f-40e6-9aae-5e273671d20b_${Date.now()}_test`;
    console.log('✅ Mock admin session created:', mockAdminSession);

    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the content of add-kyc-columns.sql');
    console.log('3. Execute the SQL script to add missing KYC columns');
    console.log('4. After that, the KYC API should work correctly');
    console.log('5. Test the admin KYC page at http://localhost:3000/admin/kyc');

  } catch (error) {
    console.error('❌ Error in KYC test:', error);
  }
}

testKYCApi(); 