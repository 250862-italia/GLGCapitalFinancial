require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Check profiles table structure
    console.log('\n👤 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('Sample profile columns:', Object.keys(profiles[0]));
      }
    }
    
    // Check clients table structure
    console.log('\n🏢 Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Clients error:', clientsError.message);
    } else {
      console.log('✅ Clients table accessible');
      if (clients && clients.length > 0) {
        console.log('Sample client columns:', Object.keys(clients[0]));
      }
    }
    
    // Check investments table structure
    console.log('\n💰 Checking investments table...');
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);
    
    if (investmentsError) {
      console.log('❌ Investments error:', investmentsError.message);
    } else {
      console.log('✅ Investments table accessible');
      if (investments && investments.length > 0) {
        console.log('Sample investment columns:', Object.keys(investments[0]));
      }
    }
    
    // Check packages table structure
    console.log('\n📦 Checking packages table...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);
    
    if (packagesError) {
      console.log('❌ Packages error:', packagesError.message);
    } else {
      console.log('✅ Packages table accessible');
      if (packages && packages.length > 0) {
        console.log('Sample package columns:', Object.keys(packages[0]));
      }
    }
    
    // Test specific column access
    console.log('\n🔍 Testing specific column access...');
    
    // Test profiles columns
    try {
      const { data: profileTest, error: profileTestError } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name')
        .limit(1);
      
      if (profileTestError) {
        console.log('❌ Profile column test error:', profileTestError.message);
      } else {
        console.log('✅ Profile columns accessible');
      }
    } catch (e) {
      console.log('❌ Profile column test exception:', e.message);
    }
    
    // Test clients columns
    try {
      const { data: clientTest, error: clientTestError } = await supabase
        .from('clients')
        .select('id, user_id, email, first_name, last_name')
        .limit(1);
      
      if (clientTestError) {
        console.log('❌ Client column test error:', clientTestError.message);
      } else {
        console.log('✅ Client columns accessible');
      }
    } catch (e) {
      console.log('❌ Client column test exception:', e.message);
    }
    
    // Check for RLS policies
    console.log('\n🔐 Checking RLS policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_rls_policies');
      
      if (policiesError) {
        console.log('❌ RLS policies check error:', policiesError.message);
      } else {
        console.log('✅ RLS policies check: OK');
      }
    } catch (e) {
      console.log('❌ RLS policies check exception:', e.message);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkDatabaseStructure().catch(console.error); 