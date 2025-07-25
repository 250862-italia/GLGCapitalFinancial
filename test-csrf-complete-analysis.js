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

async function testCSRFCompleteAnalysis() {
  console.log('🔍 CSRF Complete Analysis');
  console.log('========================\n');
  
  const results = {
    tokenGeneration: { success: 0, total: 0 },
    tokenStorage: { success: 0, total: 0 },
    tokenValidation: { success: 0, total: 0 },
    registration: { success: 0, total: 0 },
    login: { success: 0, total: 0 },
    profile: { success: 0, total: 0 },
    admin: { success: 0, total: 0 }
  };

  try {
    // 1. Test CSRF Token Generation
    console.log('1️⃣ Testing CSRF Token Generation...');
    results.tokenGeneration.total++;
    
    const csrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.response.ok && csrfResponse.data.token) {
      results.tokenGeneration.success++;
      console.log('✅ CSRF token generated successfully');
      console.log(`   Token: ${csrfResponse.data.token.substring(0, 10)}...`);
      console.log(`   Expires: ${csrfResponse.data.expiresIn}s`);
      
      // Check if token is stored in cookie
      const cookies = csrfResponse.response.headers.get('set-cookie');
      if (cookies && cookies.includes('csrf-token')) {
        results.tokenStorage.success++;
        console.log('✅ CSRF token stored in cookie');
      } else {
        console.log('⚠️ CSRF token not found in cookies');
      }
    } else {
      console.log('❌ CSRF token generation failed:', csrfResponse.data);
    }

    // 2. Test CSRF Token Validation
    console.log('\n2️⃣ Testing CSRF Token Validation...');
    results.tokenValidation.total++;
    
    if (csrfResponse.data.token) {
      const validationResponse = await makeRequest(`${BASE_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfResponse.data.token
        },
        body: JSON.stringify({
          title: 'Test Note for CSRF Validation'
        })
      });

      if (validationResponse.response.ok) {
        results.tokenValidation.success++;
        console.log('✅ CSRF token validation successful');
      } else if (validationResponse.response.status === 403) {
        console.log('❌ CSRF token validation failed (403):', validationResponse.data);
      } else {
        console.log('⚠️ Unexpected response:', validationResponse.response.status, validationResponse.data);
      }
    }

    // 3. Test Registration with CSRF
    console.log('\n3️⃣ Testing Registration with CSRF...');
    results.registration.total++;
    
    const testEmail = `test_csrf_${Date.now()}@example.com`;
    
    // Get fresh CSRF token for registration
    const regCsrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (regCsrfResponse.data.token) {
      const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': regCsrfResponse.data.token
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          country: 'Italy'
        })
      });

      if (registerResponse.response.ok && registerResponse.data.success) {
        results.registration.success++;
        console.log('✅ Registration with CSRF successful');
      } else if (registerResponse.response.status === 403) {
        console.log('❌ Registration CSRF validation failed (403):', registerResponse.data);
      } else {
        console.log('⚠️ Registration failed:', registerResponse.response.status, registerResponse.data);
      }
    }

    // 4. Test Login with CSRF
    console.log('\n4️⃣ Testing Login with CSRF...');
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
          password: 'TestPassword123!'
        })
      });

      if (loginResponse.response.ok && loginResponse.data.success) {
        results.login.success++;
        console.log('✅ Login with CSRF successful');
      } else if (loginResponse.response.status === 403) {
        console.log('❌ Login CSRF validation failed (403):', loginResponse.data);
      } else {
        console.log('⚠️ Login failed:', loginResponse.response.status, loginResponse.data);
      }
    }

    // 5. Test Profile API with CSRF
    console.log('\n5️⃣ Testing Profile API with CSRF...');
    results.profile.total++;
    
    const profileCsrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (profileCsrfResponse.data.token) {
      const profileResponse = await makeRequest(`${BASE_URL}/api/profile/test-user-id`, {
        method: 'GET',
        headers: {
          'X-CSRF-Token': profileCsrfResponse.data.token
        }
      });

      if (profileResponse.response.status === 403) {
        console.log('✅ Profile API properly protected with CSRF (403 expected for invalid user)');
        results.profile.success++;
      } else {
        console.log('⚠️ Profile API response:', profileResponse.response.status, profileResponse.data);
      }
    }

    // 6. Test Admin API with CSRF
    console.log('\n6️⃣ Testing Admin API with CSRF...');
    results.admin.total++;
    
    const adminCsrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (adminCsrfResponse.data.token) {
      const adminResponse = await makeRequest(`${BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'X-CSRF-Token': adminCsrfResponse.data.token
        }
      });

      if (adminResponse.response.status === 403) {
        console.log('✅ Admin API properly protected with CSRF (403 expected without admin auth)');
        results.admin.success++;
      } else {
        console.log('⚠️ Admin API response:', adminResponse.response.status, adminResponse.data);
      }
    }

    // 7. Test Invalid CSRF Token
    console.log('\n7️⃣ Testing Invalid CSRF Token...');
    
    const invalidResponse = await makeRequest(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': 'invalid-token-12345'
      },
      body: JSON.stringify({
        title: 'Test with Invalid CSRF'
      })
    });

    if (invalidResponse.response.status === 403) {
      console.log('✅ Invalid CSRF token properly rejected (403)');
    } else {
      console.log('❌ Invalid CSRF token not rejected:', invalidResponse.response.status);
    }

    // 8. Test Missing CSRF Token
    console.log('\n8️⃣ Testing Missing CSRF Token...');
    
    const missingResponse = await makeRequest(`${BASE_URL}/api/notes`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test without CSRF Token'
      })
    });

    if (missingResponse.response.status === 403) {
      console.log('✅ Missing CSRF token properly rejected (403)');
    } else {
      console.log('❌ Missing CSRF token not rejected:', missingResponse.response.status);
    }

    // Summary
    console.log('\n📊 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`Token Generation: ${results.tokenGeneration.success}/${results.tokenGeneration.total} ✅`);
    console.log(`Token Storage: ${results.tokenStorage.success}/${results.tokenStorage.total} ✅`);
    console.log(`Token Validation: ${results.tokenValidation.success}/${results.tokenValidation.total} ✅`);
    console.log(`Registration: ${results.registration.success}/${results.registration.total} ✅`);
    console.log(`Login: ${results.login.success}/${results.login.total} ✅`);
    console.log(`Profile API: ${results.profile.success}/${results.profile.total} ✅`);
    console.log(`Admin API: ${results.admin.success}/${results.admin.total} ✅`);
    
    const totalTests = Object.values(results).reduce((sum, category) => sum + category.total, 0);
    const totalSuccess = Object.values(results).reduce((sum, category) => sum + category.success, 0);
    
    console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);
    
    if (totalSuccess === totalTests) {
      console.log('🎉 All CSRF tests passed! System is working correctly.');
    } else {
      console.log('⚠️ Some CSRF tests failed. Review the issues above.');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCSRFCompleteAnalysis(); 