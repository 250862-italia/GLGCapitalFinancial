require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function testLoginWithCorrectCredentials() {
  console.log('🔐 Testing Login with Correct Credentials\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  // Use the credentials from our successful registration test
  const testEmail = 'test_user_1753433352187@example.com'; // From previous test
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Get CSRF Token
    console.log('1️⃣ Getting CSRF Token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      console.log('   Response:', csrfResponse.status, csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    console.log(`   Token: ${csrfData.token.substring(0, 10)}...`);

    // Step 2: Attempt Login with Correct Credentials
    console.log('\n2️⃣ Attempting Login with Correct Credentials...');
    const loginData = {
      email: testEmail,
      password: testPassword
    };

    console.log('   Login data:', {
      email: testEmail,
      password: '***hidden***'
    });

    const { response: loginResponse, data: loginResult } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(loginData)
    });

    console.log('\n📊 Login Response:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginResult.success || false}`);
    console.log(`   Error: ${loginResult.error || 'None'}`);
    console.log(`   Code: ${loginResult.code || 'None'}`);

    if (loginResponse.ok && loginResult.success) {
      console.log('\n🎉 LOGIN SUCCESSFUL!');
      console.log(`   User: ${loginResult.user?.email || testEmail}`);
      console.log(`   User ID: ${loginResult.user?.id || 'N/A'}`);
      console.log('   Session cookies should be set');
    } else {
      console.log('\n❌ LOGIN FAILED');
      
      if (loginResponse.status === 403) {
        console.log('   🔍 This is a CSRF error - CSRF system needs fixing');
      } else if (loginResponse.status === 401) {
        console.log('   🔍 This is an authentication error - invalid credentials');
      } else if (loginResponse.status === 500) {
        console.log('   🔍 This is a server error - check server logs');
        console.log('   🔍 Could be database connection or authentication service issue');
      }
      
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('   1. Check if the user exists in Supabase');
      console.log('   2. Verify the password is correct');
      console.log('   3. Check server logs for detailed error');
      console.log('   4. Verify Supabase connection');
    }

    // Step 3: Verify User Still Exists in Database
    console.log('\n3️⃣ Verifying User Still Exists in Database...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', testEmail);

      if (profilesError) {
        console.log('❌ Error checking profiles:', profilesError.message);
      } else {
        console.log(`✅ User found in profiles: ${profiles?.length || 0} record(s)`);
        if (profiles && profiles.length > 0) {
          console.log(`   Profile ID: ${profiles[0].id}`);
          console.log(`   Created: ${profiles[0].created_at}`);
        }
      }

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', testEmail);

      if (clientsError) {
        console.log('❌ Error checking clients:', clientsError.message);
      } else {
        console.log(`✅ User found in clients: ${clients?.length || 0} record(s)`);
        if (clients && clients.length > 0) {
          console.log(`   Client ID: ${clients[0].id}`);
          console.log(`   Created: ${clients[0].created_at}`);
        }
      }
    } catch (dbError) {
      console.log('❌ Database connection error:', dbError.message);
    }

    // Step 4: Summary
    console.log('\n📊 LOGIN TEST SUMMARY:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   CSRF Token: ${csrfResponse.ok ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   Login Response: ${loginResponse.status}`);
    console.log(`   Login Success: ${loginResult.success ? '✅ YES' : '❌ NO'}`);
    
    if (loginResult.success) {
      console.log('\n🎉 PERFECT! Authentication system is working correctly!');
    } else {
      console.log('\n⚠️  LOGIN ISSUE DETECTED');
      console.log('   The registration works but login has issues');
      console.log('   This suggests a problem with the login process or credentials');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginWithCorrectCredentials(); 