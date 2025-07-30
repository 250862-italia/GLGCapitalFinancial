const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing User Connection and Authentication');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testUserConnection() {
  try {
    console.log('1️⃣ Testing Supabase connection...');
    
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
    
    // Check for specific user
    console.log('\n2️⃣ Checking for specific user...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'innocentigianni2015@gmail.com')
      .single();
    
    if (userError) {
      console.log('❌ Error fetching user:', userError.message);
      return false;
    }
    
    if (user) {
      console.log('✅ User found:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   First Name: ${user.first_name}`);
      console.log(`   Last Name: ${user.last_name}`);
    } else {
      console.log('❌ User not found');
      return false;
    }
    
    // Test auth directly
    console.log('\n3️⃣ Testing direct authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'innocentigianni2015@gmail.com',
      password: '123Admin'
    });
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return false;
    }
    
    if (authData.user) {
      console.log('✅ Authentication successful:');
      console.log(`   User ID: ${authData.user.id}`);
      console.log(`   Email: ${authData.user.email}`);
      console.log(`   Email Confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ No user data returned');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
    return false;
  }
}

async function main() {
  const success = await testUserConnection();
  
  if (success) {
    console.log('\n✅ User connection test completed successfully!');
  } else {
    console.log('\n❌ User connection test failed');
  }
}

main().catch(console.error); 