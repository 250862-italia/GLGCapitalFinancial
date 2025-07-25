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

async function testCompleteAuthFlow() {
  console.log('🔐 Testing Complete Authentication Flow\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Empty');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Empty');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Test CSRF Token Generation
    console.log('1️⃣ Testing CSRF Token Generation...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.ok && csrfData.token) {
      console.log('✅ CSRF token generated successfully');
      console.log(`   Token: ${csrfData.token.substring(0, 10)}...`);
    } else {
      console.log('❌ CSRF token generation failed');
      console.log('   Response:', csrfResponse.status, csrfData);
      return;
    }

    // Step 2: Test User Registration
    console.log('\n2️⃣ Testing User Registration...');
    const registrationData = {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };

    const { response: regResponse, data: regData } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(registrationData)
    });

    if (regResponse.ok && regData.success) {
      console.log('✅ User registration successful');
      console.log(`   Email: ${testEmail}`);
      console.log(`   User ID: ${regData.userId || 'N/A'}`);
    } else {
      console.log('❌ User registration failed');
      console.log('   Response:', regResponse.status, regData);
      return;
    }

    // Step 3: Test Login with New User
    console.log('\n3️⃣ Testing Login with New User...');
    const loginData = {
      email: testEmail,
      password: testPassword
    };

    const { response: loginResponse, data: loginResult } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(loginData)
    });

    if (loginResponse.ok && loginResult.success) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginResult.user?.email || testEmail}`);
    } else {
      console.log('❌ Login failed');
      console.log('   Response:', loginResponse.status, loginResult);
      
      // Check if it's a CSRF error or authentication error
      if (loginResponse.status === 403) {
        console.log('   🔍 This is a CSRF error - CSRF system needs fixing');
      } else if (loginResponse.status === 401 || loginResponse.status === 500) {
        console.log('   🔍 This is an authentication error - credentials or database issue');
      }
    }

    // Step 4: Verify User in Database
    console.log('\n4️⃣ Verifying User in Database...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', testEmail);

      if (authError) {
        console.log('❌ Error checking auth.users:', authError.message);
      } else {
        console.log('✅ Auth users found:', authUsers?.length || 0);
        if (authUsers && authUsers.length > 0) {
          console.log('   User in auth.users:', {
            id: authUsers[0].id,
            email: authUsers[0].email,
            created_at: authUsers[0].created_at
          });
        }
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', testEmail);

      if (profilesError) {
        console.log('❌ Error checking profiles:', profilesError.message);
      } else {
        console.log('✅ Profiles found:', profiles?.length || 0);
        if (profiles && profiles.length > 0) {
          console.log('   Profile data:', {
            id: profiles[0].id,
            email: profiles[0].email,
            first_name: profiles[0].first_name,
            last_name: profiles[0].last_name
          });
        }
      }

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', testEmail);

      if (clientsError) {
        console.log('❌ Error checking clients:', clientsError.message);
      } else {
        console.log('✅ Clients found:', clients?.length || 0);
        if (clients && clients.length > 0) {
          console.log('   Client data:', {
            id: clients[0].id,
            email: clients[0].email,
            first_name: clients[0].first_name,
            last_name: clients[0].last_name
          });
        }
      }

    } catch (dbError) {
      console.log('❌ Database connection error:', dbError.message);
    }

    // Step 5: Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('   CSRF Token Generation:', csrfResponse.ok ? '✅ PASS' : '❌ FAIL');
    console.log('   User Registration:', regResponse.ok ? '✅ PASS' : '❌ FAIL');
    console.log('   User Login:', loginResponse.ok ? '✅ PASS' : '❌ FAIL');
    
    if (loginResponse.ok) {
      console.log('\n🎉 ALL TESTS PASSED! Authentication system is working perfectly!');
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS: Registration works but login needs attention');
      console.log('   Next steps: Check login credentials or database connection');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCompleteAuthFlow(); 