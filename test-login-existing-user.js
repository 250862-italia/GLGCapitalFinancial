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

async function testLoginExistingUser() {
  console.log('🔐 Testing Login with Existing User\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const testEmail = 'innocentigianni2015@gmail.com';
  const testPassword = '123Admin';

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

    // Step 2: Attempt Login
    console.log('\n2️⃣ Attempting Login...');
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
      
      console.log('\n✅ CONCLUSION:');
      console.log('   The user exists and can login successfully!');
      console.log('   The 409 registration error is correct behavior.');
      console.log('   You can use these credentials to access the system.');
      
    } else {
      console.log('\n❌ LOGIN FAILED');
      
      if (loginResponse.status === 403) {
        console.log('   🔍 This is a CSRF error - CSRF system needs fixing');
      } else if (loginResponse.status === 401) {
        console.log('   🔍 This is an authentication error - invalid credentials');
        console.log('   🔍 The user might exist but password is wrong');
      } else if (loginResponse.status === 500) {
        console.log('   🔍 This is a server error - check server logs');
      }
      
      console.log('\n🔧 Next Steps:');
      console.log('   1. Try different password');
      console.log('   2. Check if user was fully registered');
      console.log('   3. Try registering with a different email');
    }

    // Step 3: Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   CSRF Token: ${csrfResponse.ok ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   Login Response: ${loginResponse.status}`);
    console.log(`   Login Success: ${loginResult.success ? '✅ YES' : '❌ NO'}`);
    
    if (loginResult.success) {
      console.log('\n🎉 PERFECT! User exists and can login!');
      console.log('   The registration system is working correctly.');
      console.log('   The 409 error during registration is expected behavior.');
    } else {
      console.log('\n⚠️  LOGIN ISSUE DETECTED');
      console.log('   The user might exist but cannot login.');
      console.log('   This could indicate a password issue or incomplete registration.');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginExistingUser(); 