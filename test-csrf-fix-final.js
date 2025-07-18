const BASE_URL = 'http://localhost:3000';

async function testCSRFSystem() {
  console.log('🧪 Testing CSRF Token Validation System...\n');

  try {
    // Test 1: Get CSRF token
    console.log('1️⃣ Testing CSRF token generation...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (!csrfData.token) {
      throw new Error('No CSRF token received');
    }
    console.log('✅ CSRF token generated successfully:', csrfData.token.substring(0, 10) + '...');

    // Test 2: Test registration with CSRF token
    console.log('\n2️⃣ Testing registration with CSRF token...');
    const testEmail = `test_${Date.now()}@example.com`;
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.status === 403) {
      console.log('❌ Registration failed with CSRF error:', registerData.error);
    } else if (registerResponse.ok) {
      console.log('✅ Registration successful with CSRF token');
    } else {
      console.log('⚠️ Registration failed for other reasons:', registerData.error);
    }

    // Test 3: Test login with CSRF token
    console.log('\n3️⃣ Testing login with CSRF token...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.status === 403) {
      console.log('❌ Login failed with CSRF error:', loginData.error);
    } else if (loginResponse.ok) {
      console.log('✅ Login successful with CSRF token');
    } else {
      console.log('⚠️ Login failed for other reasons:', loginData.error);
    }

    // Test 4: Test without CSRF token (should fail)
    console.log('\n4️⃣ Testing request without CSRF token (should fail)...');
    const noCsrfResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    const noCsrfData = await noCsrfResponse.json();
    
    if (noCsrfResponse.status === 403) {
      console.log('✅ Request correctly rejected without CSRF token');
    } else {
      console.log('❌ Request should have been rejected without CSRF token');
    }

    // Test 5: Test with invalid CSRF token (should fail)
    console.log('\n5️⃣ Testing request with invalid CSRF token (should fail)...');
    const invalidCsrfResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-123'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    const invalidCsrfData = await invalidCsrfResponse.json();
    
    if (invalidCsrfResponse.status === 403) {
      console.log('✅ Request correctly rejected with invalid CSRF token');
    } else {
      console.log('❌ Request should have been rejected with invalid CSRF token');
    }

    // Test 6: Test frontend CSRF client
    console.log('\n6️⃣ Testing frontend CSRF client...');
    const frontendTestResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': csrfData.token
      }
    });

    if (frontendTestResponse.status === 403) {
      console.log('❌ Frontend request failed with CSRF error');
    } else {
      console.log('✅ Frontend request successful with CSRF token');
    }

    console.log('\n🎉 CSRF Token Validation Test Completed!');
    console.log('\n📊 Summary:');
    console.log('- CSRF token generation: ✅');
    console.log('- Registration with CSRF: ' + (registerResponse.ok ? '✅' : '❌'));
    console.log('- Login with CSRF: ' + (loginResponse.ok ? '✅' : '❌'));
    console.log('- Rejection without CSRF: ' + (noCsrfResponse.status === 403 ? '✅' : '❌'));
    console.log('- Rejection with invalid CSRF: ' + (invalidCsrfResponse.status === 403 ? '✅' : '❌'));
    console.log('- Frontend CSRF client: ' + (frontendTestResponse.status !== 403 ? '✅' : '❌'));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCSRFSystem(); 