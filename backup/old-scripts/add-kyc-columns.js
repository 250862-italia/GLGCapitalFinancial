const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addKYCColumns() {
  try {
    console.log('🔧 Adding KYC columns to clients table...');

    // 1. Test basic access first
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Error accessing clients table:', testError.message);
      return;
    }

    console.log('✅ Clients table is accessible');

    // 2. Check which columns already exist
    const { data: sampleClient, error: sampleError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error getting sample client:', sampleError.message);
      return;
    }

    const existingColumns = sampleClient.length > 0 ? Object.keys(sampleClient[0]) : [];
    console.log('📋 Existing columns:', existingColumns);

    // 3. Define KYC columns to add
    const kycColumns = [
      { name: 'annual_income', type: 'DECIMAL(15,2)', default: '0.00' },
      { name: 'net_worth', type: 'DECIMAL(15,2)', default: '0.00' },
      { name: 'investment_experience', type: 'TEXT', default: "'beginner'" },
      { name: 'risk_tolerance', type: 'TEXT', default: "'medium'" },
      { name: 'investment_goals', type: 'JSONB', default: "'{}'" },
      { name: 'preferred_investment_types', type: 'JSONB', default: "'[]'" },
      { name: 'monthly_investment_budget', type: 'DECIMAL(15,2)', default: '0.00' },
      { name: 'emergency_fund', type: 'DECIMAL(15,2)', default: '0.00' },
      { name: 'debt_amount', type: 'DECIMAL(15,2)', default: '0.00' },
      { name: 'credit_score', type: 'INTEGER', default: '0' },
      { name: 'employment_status', type: 'TEXT', default: "''" },
      { name: 'employer_name', type: 'TEXT', default: "''" },
      { name: 'job_title', type: 'TEXT', default: "''" },
      { name: 'years_employed', type: 'INTEGER', default: '0' },
      { name: 'source_of_funds', type: 'TEXT', default: "''" },
      { name: 'tax_residency', type: 'TEXT', default: "''" },
      { name: 'tax_id', type: 'TEXT', default: "''" },
      { name: 'risk_profile', type: 'TEXT', default: "'moderate'" }
    ];

    // 4. Check which columns are missing
    const missingColumns = kycColumns.filter(col => !existingColumns.includes(col.name));
    
    if (missingColumns.length === 0) {
      console.log('✅ All KYC columns already exist');
      return;
    }

    console.log(`⚠️ Missing ${missingColumns.length} KYC columns:`, missingColumns.map(c => c.name));

    // 5. Since we can't add columns directly via Supabase client, we'll note what needs to be done
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the content of add-kyc-columns.sql');
    console.log('3. Execute the SQL script');
    console.log('4. This will add all missing KYC columns to the clients table');

    // 6. Test if we can query with some basic KYC columns
    console.log('\n🧪 Testing KYC query with existing columns...');
    
    try {
      const { data: kycTest, error: kycError } = await supabase
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
          total_invested,
          risk_profile
        `)
        .limit(3);

      if (kycError) {
        console.log('❌ KYC query error:', kycError.message);
      } else {
        console.log('✅ Basic KYC query works with existing columns');
        console.log(`📊 Found ${kycTest.length} clients with basic KYC data`);
      }
    } catch (queryError) {
      console.log('❌ Query execution error:', queryError.message);
    }

    // 7. Show current client count
    const { data: clientCount, error: countError } = await supabase
      .from('clients')
      .select('id', { count: 'exact' });

    if (countError) {
      console.log('❌ Error counting clients:', countError.message);
    } else {
      console.log(`📊 Total clients in database: ${clientCount.length}`);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Execute add-kyc-columns.sql in Supabase SQL Editor');
    console.log('2. Run: node test-kyc-api.js to verify the fix');
    console.log('3. Test the admin KYC page at http://localhost:3000/admin/kyc');

  } catch (error) {
    console.error('❌ Error adding KYC columns:', error);
  }
}

addKYCColumns(); 