const BASE_URL = 'http://localhost:3000';

async function testCSRFFixComplete() {
  console.log('🔒 Complete CSRF Fix Verification Test');
  console.log('=====================================');
  
  const results = {
    csrf: { success: 0, errors: [], total: 0 },
    auth: { success: 0, errors: [], total: 0 },
    profile: { success: 0, errors: [], total: 0 },
    admin: { success: 0, errors: [], total: 0 }
  };

  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Testing CSRF Token Generation...');
    results.csrf.total++;
    
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (csrfResponse.ok && csrfData.token) {
      results.csrf.success++;
      console.log('✅ CSRF token generated successfully');
    } else {
      results.csrf.errors.push(`CSRF generation failed: ${csrfResponse.status}`);
      console.log('❌ CSRF token generation failed');
      return;
    }

    // 2. Test Registration without CSRF (should fail)
    console.log('\n2️⃣ Testing Registration without CSRF (should fail)...');
    results.auth.total++;
    
    const registerResponseNoCSRF = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });

    const registerDataNoCSRF = await registerResponseNoCSRF.json();
    
    if (registerResponseNoCSRF.status === 403 && registerDataNoCSRF.error?.includes('CSRF')) {
      results.auth.success++;
      console.log('✅ Registration properly rejected without CSRF token');
    } else {
      results.auth.errors.push(`Registration should have failed without CSRF: ${registerResponseNoCSRF.status}`);
      console.log('❌ Registration should have failed without CSRF token');
    }

    // 3. Test Registration with CSRF (should succeed)
    console.log('\n3️⃣ Testing Registration with CSRF (should succeed)...');
    results.auth.total++;
    
    const testEmail = `test_${Date.now()}@example.com`;
    const registerResponseWithCSRF = await fetch(`${BASE_URL}/api/auth/register`, {
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

    const registerDataWithCSRF = await registerResponseWithCSRF.json();
    
    if (registerResponseWithCSRF.ok && registerDataWithCSRF.success) {
      results.auth.success++;
      console.log('✅ Registration successful with CSRF token');
    } else {
      results.auth.errors.push(`Registration failed with CSRF: ${registerDataWithCSRF.error || registerResponseWithCSRF.status}`);
      console.log('❌ Registration failed with CSRF token');
    }

    // 4. Test Profile API without CSRF (should fail)
    console.log('\n4️⃣ Testing Profile API without CSRF (should fail)...');
    results.profile.total++;
    
    const profileResponseNoCSRF = await fetch(`${BASE_URL}/api/profile/test-user-id`);
    
    if (profileResponseNoCSRF.status === 403) {
      results.profile.success++;
      console.log('✅ Profile API properly protected with CSRF');
    } else {
      results.profile.errors.push(`Profile API should be protected: ${profileResponseNoCSRF.status}`);
      console.log('❌ Profile API not properly protected with CSRF');
    }

    // 5. Test Admin API without CSRF (should fail)
    console.log('\n5️⃣ Testing Admin API without CSRF (should fail)...');
    results.admin.total++;
    
    const adminResponseNoCSRF = await fetch(`${BASE_URL}/api/admin/users`);
    
    if (adminResponseNoCSRF.status === 403) {
      results.admin.success++;
      console.log('✅ Admin API properly protected with CSRF');
    } else {
      results.admin.errors.push(`Admin API should be protected: ${adminResponseNoCSRF.status}`);
      console.log('❌ Admin API not properly protected with CSRF');
    }

    // 6. Test Admin API with CSRF (should work if admin token provided)
    console.log('\n6️⃣ Testing Admin API with CSRF...');
    results.admin.total++;
    
    const adminResponseWithCSRF = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'X-CSRF-Token': csrfData.token
      }
    });
    
    // Should either succeed with proper admin auth or fail with auth error, but not CSRF error
    if (adminResponseWithCSRF.status !== 403 || !adminResponseWithCSRF.statusText.includes('CSRF')) {
      results.admin.success++;
      console.log('✅ Admin API working with CSRF (auth error expected without admin token)');
    } else {
      results.admin.errors.push(`Admin API failed with CSRF: ${adminResponseWithCSRF.status}`);
      console.log('❌ Admin API failed with CSRF token');
    }

    // 7. Test Investments API without CSRF (should fail)
    console.log('\n7️⃣ Testing Investments API without CSRF (should fail)...');
    results.profile.total++;
    
    const investmentsResponseNoCSRF = await fetch(`${BASE_URL}/api/investments`);
    
    if (investmentsResponseNoCSRF.status === 403) {
      results.profile.success++;
      console.log('✅ Investments API properly protected with CSRF');
    } else {
      results.profile.errors.push(`Investments API should be protected: ${investmentsResponseNoCSRF.status}`);
      console.log('❌ Investments API not properly protected with CSRF');
    }

    // 8. Test Login without CSRF (should fail)
    console.log('\n8️⃣ Testing Login without CSRF (should fail)...');
    results.auth.total++;
    
    const loginResponseNoCSRF = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    const loginDataNoCSRF = await loginResponseNoCSRF.json();
    
    if (loginResponseNoCSRF.status === 403 && loginDataNoCSRF.error?.includes('CSRF')) {
      results.auth.success++;
      console.log('✅ Login properly rejected without CSRF token');
    } else {
      results.auth.errors.push(`Login should have failed without CSRF: ${loginResponseNoCSRF.status}`);
      console.log('❌ Login should have failed without CSRF token');
    }

    // 9. Test Login with CSRF (should succeed)
    console.log('\n9️⃣ Testing Login with CSRF (should succeed)...');
    results.auth.total++;
    
    // Get a fresh CSRF token
    const newCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const newCsrfData = await newCsrfResponse.json();
    
    const loginResponseWithCSRF = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': newCsrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    const loginDataWithCSRF = await loginResponseWithCSRF.json();
    
    if (loginResponseWithCSRF.ok && loginDataWithCSRF.success) {
      results.auth.success++;
      console.log('✅ Login successful with CSRF token');
    } else {
      results.auth.errors.push(`Login failed with CSRF: ${loginDataWithCSRF.error || loginResponseWithCSRF.status}`);
      console.log('❌ Login failed with CSRF token');
    }

    console.log('\n📊 COMPLETE TEST RESULTS');
    console.log('========================');
    console.log(`CSRF Generation: ${results.csrf.success}/${results.csrf.total}`);
    console.log(`Auth Routes: ${results.auth.success}/${results.auth.total}`);
    console.log(`Profile Routes: ${results.profile.success}/${results.profile.total}`);
    console.log(`Admin Routes: ${results.admin.success}/${results.admin.total}`);

    const totalTests = Object.values(results).reduce((sum, category) => sum + category.total, 0);
    const totalSuccess = Object.values(results).reduce((sum, category) => sum + category.success, 0);

    console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);

    if (totalSuccess === totalTests) {
      console.log('✅ All CSRF protections working correctly!');
    } else {
      console.log('⚠️ Some CSRF protections need attention');
      Object.entries(results).forEach(([category, result]) => {
        if (result.errors.length > 0) {
          console.log(`\n❌ ${category.toUpperCase()} errors:`);
          result.errors.forEach(error => console.log(`   - ${error}`));
        }
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCSRFFixComplete(); 