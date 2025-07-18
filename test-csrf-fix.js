const BASE_URL = 'http://localhost:3001';

async function testCSRFFix() {
  console.log('🔧 Test CSRF Fix');
  console.log('================');
  
  const results = {
    csrf: { success: 0, errors: [], total: 0 },
    register: { success: 0, errors: [], total: 0 },
    login: { success: 0, errors: [], total: 0 }
  };

  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Test CSRF Token Generation...');
    results.csrf.total++;
    
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (csrfResponse.ok && csrfData.token) {
      results.csrf.success++;
      console.log('✅ CSRF token generated successfully');
      console.log(`   Token: ${csrfData.token.substring(0, 10)}...`);
    } else {
      results.csrf.errors.push(`CSRF generation failed: ${csrfResponse.status}`);
      console.log('❌ CSRF token generation failed');
    }

    // 2. Test Registration with CSRF
    console.log('\n2️⃣ Test Registration with CSRF...');
    results.register.total++;
    
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok && registerData.success) {
      results.register.success++;
      console.log('✅ Registration with CSRF successful');
    } else {
      results.register.errors.push(`Registration failed: ${registerData.error || registerResponse.status}`);
      console.log('❌ Registration with CSRF failed:', registerData.error);
    }

    // 3. Test Login with CSRF
    console.log('\n3️⃣ Test Login with CSRF...');
    results.login.total++;
    
    // Get fresh CSRF token for login
    const csrfResponse2 = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData2 = await csrfResponse2.json();
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData2.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      results.login.success++;
      console.log('✅ Login with CSRF successful');
    } else {
      results.login.errors.push(`Login failed: ${loginData.error || loginResponse.status}`);
      console.log('❌ Login with CSRF failed:', loginData.error);
    }

    // 4. Test without CSRF (should fail)
    console.log('\n4️⃣ Test without CSRF (should fail)...');
    
    const noCsrfResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No CSRF token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (noCsrfResponse.status === 403) {
      console.log('✅ CSRF protection working - request without token rejected');
    } else {
      console.log('⚠️ CSRF protection may not be working - request without token accepted');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // 5. Report
  console.log('\n📊 TEST RESULTS');
  console.log('===============');
  console.log(`CSRF Generation: ${results.csrf.success}/${results.csrf.total}`);
  console.log(`Registration: ${results.register.success}/${results.register.total}`);
  console.log(`Login: ${results.login.success}/${results.login.total}`);
  
  if (results.csrf.errors.length > 0) {
    console.log('\n❌ CSRF Errors:', results.csrf.errors);
  }
  if (results.register.errors.length > 0) {
    console.log('\n❌ Registration Errors:', results.register.errors);
  }
  if (results.login.errors.length > 0) {
    console.log('\n❌ Login Errors:', results.login.errors);
  }

  const totalSuccess = results.csrf.success + results.register.success + results.login.success;
  const totalTests = results.csrf.total + results.register.total + results.login.total;
  
  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 CSRF system is working correctly!');
  } else {
    console.log('⚠️ Some tests failed - CSRF system needs attention');
  }
}

// Run the test
testCSRFFix().catch(console.error); 