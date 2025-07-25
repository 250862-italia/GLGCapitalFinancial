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

async function testLoginCSRFFix() {
  console.log('🔐 Testing Login CSRF Fix');
  console.log('==========================');
  
  const testEmail = `test_login_csrf_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const results = {
    csrf: { success: 0, total: 0, errors: [] },
    registration: { success: 0, total: 0, errors: [] },
    login: { success: 0, total: 0, errors: [] },
    loginWithoutCSRF: { success: 0, total: 0, errors: [] }
  };

  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Testing CSRF token generation...');
    results.csrf.total++;
    
    const csrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.data.token) {
      results.csrf.success++;
      console.log('✅ CSRF token generated successfully');
    } else {
      results.csrf.errors.push('Failed to generate CSRF token');
      console.log('❌ CSRF token generation failed');
    }

    // 2. Test Registration with CSRF
    console.log('\n2️⃣ Testing Registration with CSRF...');
    results.registration.total++;
    
    const regCsrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (regCsrfResponse.data.token) {
      const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': regCsrfResponse.data.token
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'Login',
          country: 'Italy'
        })
      });

      if (registerResponse.response.ok && registerResponse.data.success) {
        results.registration.success++;
        console.log('✅ Registration with CSRF successful');
      } else {
        results.registration.errors.push(`Registration failed: ${registerResponse.data.error || registerResponse.response.status}`);
        console.log('❌ Registration failed:', registerResponse.response.status, registerResponse.data);
      }
    }

    // 3. Test Login with CSRF
    console.log('\n3️⃣ Testing Login with CSRF...');
    results.login.total++;
    
    const loginCsrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (loginCsrfResponse.data.token) {
      const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': loginCsrfResponse.data.token
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      if (loginResponse.response.ok && loginResponse.data.success) {
        results.login.success++;
        console.log('✅ Login with CSRF successful');
        console.log('📋 User data:', {
          id: loginResponse.data.user?.id,
          email: loginResponse.data.user?.email,
          name: loginResponse.data.user?.name
        });
      } else {
        results.login.errors.push(`Login failed: ${loginResponse.data.error || loginResponse.response.status}`);
        console.log('❌ Login failed:', loginResponse.response.status, loginResponse.data);
      }
    }

    // 4. Test Login without CSRF (should fail)
    console.log('\n4️⃣ Testing Login without CSRF (should fail)...');
    results.loginWithoutCSRF.total++;
    
    const loginNoCsrfResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (loginNoCsrfResponse.response.status === 403) {
      results.loginWithoutCSRF.success++;
      console.log('✅ Login properly rejected without CSRF token (403)');
    } else {
      results.loginWithoutCSRF.errors.push(`Login should have failed without CSRF: ${loginNoCsrfResponse.response.status}`);
      console.log('❌ Login should have failed without CSRF token');
    }

    // 5. Test multiple login attempts with same token (should work in development)
    console.log('\n5️⃣ Testing multiple login attempts with same token...');
    
    if (loginCsrfResponse.data.token) {
      const loginResponse2 = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': loginCsrfResponse.data.token
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      if (loginResponse2.response.ok && loginResponse2.data.success) {
        console.log('✅ Multiple login attempts with same token successful (development mode)');
      } else {
        console.log('⚠️ Multiple login attempts with same token failed:', loginResponse2.response.status);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Report results
  console.log('\n📊 TEST RESULTS');
  console.log('===============');
  console.log(`CSRF Generation: ${results.csrf.success}/${results.csrf.total}`);
  console.log(`Registration: ${results.registration.success}/${results.registration.total}`);
  console.log(`Login with CSRF: ${results.login.success}/${results.login.total}`);
  console.log(`Login without CSRF: ${results.loginWithoutCSRF.success}/${results.loginWithoutCSRF.total}`);

  if (results.csrf.errors.length > 0) {
    console.log('\n❌ CSRF Errors:', results.csrf.errors);
  }
  if (results.registration.errors.length > 0) {
    console.log('\n❌ Registration Errors:', results.registration.errors);
  }
  if (results.login.errors.length > 0) {
    console.log('\n❌ Login Errors:', results.login.errors);
  }
  if (results.loginWithoutCSRF.errors.length > 0) {
    console.log('\n❌ Login without CSRF Errors:', results.loginWithoutCSRF.errors);
  }

  const totalTests = results.csrf.total + results.registration.total + results.login.total + results.loginWithoutCSRF.total;
  const totalSuccess = results.csrf.success + results.registration.success + results.login.success + results.loginWithoutCSRF.success;

  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);

  if (totalSuccess === totalTests) {
    console.log('🎉 ALL LOGIN CSRF TESTS PASSED! Login system is working perfectly!');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }

  return totalSuccess === totalTests;
}

// Run the test
if (require.main === module) {
  testLoginCSRFFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testLoginCSRFFix }; 