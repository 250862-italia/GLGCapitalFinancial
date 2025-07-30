const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Production Connection Issues');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testProductionConnection() {
  try {
    console.log('1️⃣ Testing direct Supabase connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
      return false;
    }
    
    console.log('✅ Connection test passed');
    
    // Test authentication
    console.log('\n2️⃣ Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@glgcapital.com',
      password: 'TestPassword123!'
    });
    
    if (authError) {
      console.log('❌ Auth test failed:', authError.message);
      return false;
    }
    
    console.log('✅ Auth test passed');
    
    // Test profile retrieval
    console.log('\n3️⃣ Testing profile retrieval...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile retrieval failed:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile retrieval passed');
    
    // Test client retrieval
    console.log('\n4️⃣ Testing client retrieval...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (clientError) {
      console.log('⚠️ Client retrieval failed (expected):', clientError.message);
      // This is expected if client doesn't exist
    } else {
      console.log('✅ Client retrieval passed');
    }
    
    console.log('\n✅ All production tests passed!');
    return true;
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
    return false;
  }
}

async function main() {
  const success = await testProductionConnection();
  
  if (success) {
    console.log('\n🎉 Production connection is working correctly!');
    console.log('The issue might be in the wrapper or error handling.');
  } else {
    console.log('\n❌ Production connection has issues');
  }
}

main().catch(console.error); 