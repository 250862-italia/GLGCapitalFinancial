require('dotenv').config({ path: '.env.local' });

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

async function testProfileUI() {
  console.log('🔧 TESTING PROFILE PAGE UI\n');
  
  try {
    // STEP 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.status !== 200) {
      console.log('❌ Failed to get CSRF token:', csrfResponse.status);
      return;
    }

    const csrfToken = csrfData.token;
    console.log('✅ CSRF token obtained:', csrfToken.substring(0, 10) + '...');

    // STEP 2: Login with test user
    console.log('\n2️⃣ Logging in with test user...');
    const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: 'innocentigianni2015@gmail.com',
        password: 'TestPassword123!'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginData);
      return;
    }

    console.log('✅ Login successful');
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');

    // STEP 3: Test profile page access
    console.log('\n3️⃣ Testing profile page access...');
    const { response: profileResponse } = await makeRequest(`${BASE_URL}/profile`, {
      headers: {
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      }
    });

    console.log('📄 Profile page response status:', profileResponse.status);
    
    if (profileResponse.ok) {
      console.log('✅ Profile page accessible');
    } else {
      console.log('❌ Profile page not accessible');
    }

    // STEP 4: Test profile data API
    console.log('\n4️⃣ Testing profile data API...');
    const { response: profileDataResponse, data: profileData } = await makeRequest(`${BASE_URL}/api/profile/${loginData.user.id}`, {
      headers: {
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      }
    });

    console.log('📊 Profile data response status:', profileDataResponse.status);
    
    if (profileDataResponse.ok) {
      console.log('✅ Profile data API working');
      console.log('📝 Profile data keys:', Object.keys(profileData));
    } else {
      console.log('❌ Profile data API failed');
    }

    // STEP 5: Test auth check
    console.log('\n5️⃣ Testing auth check...');
    const { response: authResponse, data: authData } = await makeRequest(`${BASE_URL}/api/auth/check`, {
      headers: {
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      }
    });

    console.log('🔐 Auth check response status:', authResponse.status);
    
    if (authResponse.ok) {
      console.log('✅ Auth check working');
      console.log('👤 User authenticated:', authData.user?.email);
    } else {
      console.log('❌ Auth check failed');
    }

    // STEP 6: Summary
    console.log('\n📊 UI TEST SUMMARY:');
    console.log(`  - CSRF Token: ✅`);
    console.log(`  - Login: ${loginResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Profile Page: ${profileResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Profile Data API: ${profileDataResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Auth Check: ${authResponse.ok ? '✅' : '❌'}`);

    // STEP 7: Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (!profileResponse.ok) {
      console.log('  - Profile page might have authentication issues');
    }
    if (!profileDataResponse.ok) {
      console.log('  - Profile data API might have issues');
    }
    if (!authResponse.ok) {
      console.log('  - Authentication might have issues');
    }
    if (profileResponse.ok && profileDataResponse.ok && authResponse.ok) {
      console.log('  - All APIs working correctly');
      console.log('  - UI issues might be client-side only');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProfileUI(); 