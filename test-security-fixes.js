require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSecurityFixes() {
  console.log('🔒 Testing Security Fixes\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Test 1: Check function search path
    console.log('1️⃣ Testing Function Search Path...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('check_function_search_path');

    if (functionError) {
      console.log('⚠️ Function search path check failed (expected if function not created yet):', functionError.message);
    } else {
      console.log('✅ Function search path check passed');
    }

    // Test 2: Test password strength function
    console.log('\n2️⃣ Testing Password Strength Function...');
    const { data: passwordData, error: passwordError } = await supabase
      .rpc('check_password_strength', { password: 'WeakPassword123!' });

    if (passwordError) {
      console.log('⚠️ Password strength function not available yet:', passwordError.message);
    } else {
      console.log('✅ Password strength function works:', passwordData);
    }

    // Test 3: Test MFA functions
    console.log('\n3️⃣ Testing MFA Functions...');
    const { data: mfaData, error: mfaError } = await supabase
      .rpc('get_user_mfa_status', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (mfaError) {
      console.log('⚠️ MFA functions not available yet:', mfaError.message);
    } else {
      console.log('✅ MFA functions work:', mfaData);
    }

    // Test 4: Check MFA statistics view
    console.log('\n4️⃣ Testing MFA Statistics View...');
    const { data: statsData, error: statsError } = await supabase
      .from('mfa_statistics')
      .select('*')
      .limit(1);

    if (statsError) {
      console.log('⚠️ MFA statistics view not available yet:', statsError.message);
    } else {
      console.log('✅ MFA statistics view works:', statsData);
    }

    console.log('\n🎉 Security Fixes Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Execute the SQL scripts in Supabase SQL Editor');
    console.log('2. Enable leaked password protection in Supabase Dashboard');
    console.log('3. Configure MFA options in Supabase Dashboard');
    console.log('4. Run this test again to verify all fixes');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSecurityFixes(); 