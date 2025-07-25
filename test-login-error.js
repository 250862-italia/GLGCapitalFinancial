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

async function testLoginError() {
  console.log('🔍 DEBUGGING LOGIN ERROR 500\n');
  
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

    // STEP 2: Test login with correct credentials
    console.log('\n2️⃣ Testing login with correct credentials...');
    const loginData = {
      email: 'innocentigianni2015@gmail.com',
      password: 'TestPassword123!'
    };

    const { response: loginResponse, data: loginDataResponse } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(loginData)
      }
    );

    console.log(`📊 Login Response Status: ${loginResponse.status}`);
    console.log('📄 Login Response Data:', JSON.stringify(loginDataResponse, null, 2));

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
    } else if (loginResponse.status === 500) {
      console.log('❌ Login failed with 500 error');
      console.log('🔍 Error details:', loginDataResponse);
    } else {
      console.log(`⚠️ Login failed with status: ${loginResponse.status}`);
    }

    // STEP 3: Test login with wrong password
    console.log('\n3️⃣ Testing login with wrong password...');
    const wrongLoginData = {
      email: 'innocentigianni2015@gmail.com',
      password: 'WrongPassword123!'
    };

    const { response: wrongLoginResponse, data: wrongLoginDataResponse } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(wrongLoginData)
      }
    );

    console.log(`📊 Wrong Password Response Status: ${wrongLoginResponse.status}`);
    console.log('📄 Wrong Password Response Data:', JSON.stringify(wrongLoginDataResponse, null, 2));

    // STEP 4: Test login with non-existent email
    console.log('\n4️⃣ Testing login with non-existent email...');
    const nonExistentLoginData = {
      email: 'nonexistent@example.com',
      password: 'TestPassword123!'
    };

    const { response: nonExistentResponse, data: nonExistentDataResponse } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(nonExistentLoginData)
      }
    );

    console.log(`📊 Non-existent Email Response Status: ${nonExistentResponse.status}`);
    console.log('📄 Non-existent Email Response Data:', JSON.stringify(nonExistentDataResponse, null, 2));

    // STEP 5: Test without CSRF token
    console.log('\n5️⃣ Testing login without CSRF token...');
    const { response: noCsrfResponse, data: noCsrfDataResponse } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify(loginData)
      }
    );

    console.log(`📊 No CSRF Response Status: ${noCsrfResponse.status}`);
    console.log('📄 No CSRF Response Data:', JSON.stringify(noCsrfDataResponse, null, 2));

    // SUMMARY
    console.log('\n📊 SUMMARY:');
    console.log('✅ Correct credentials test completed');
    console.log('✅ Wrong password test completed');
    console.log('✅ Non-existent email test completed');
    console.log('✅ No CSRF token test completed');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testLoginError(); 