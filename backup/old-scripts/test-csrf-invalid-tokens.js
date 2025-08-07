const BASE_URL = 'http://localhost:3000';

async function testCSRFInvalidTokens() {
  console.log('🚫 Testing CSRF Invalid Token Rejection');
  console.log('=======================================');
  
  const results = {
    validToken: { success: 0, total: 0 },
    invalidToken: { success: 0, total: 0 },
    noToken: { success: 0, total: 0 }
  };

  try {
    // 1. Test with valid CSRF token
    console.log('\n1️⃣ Testing with valid CSRF token...');
    results.validToken.total++;
    
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    const validResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        title: 'Test Note with Valid CSRF'
      })
    });

    if (validResponse.ok) {
      results.validToken.success++;
      console.log('✅ Request with valid CSRF token succeeded');
    } else {
      console.log('❌ Request with valid CSRF token failed:', validResponse.status);
    }

    // 2. Test with invalid CSRF token
    console.log('\n2️⃣ Testing with invalid CSRF token...');
    results.invalidToken.total++;
    
    const invalidResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-12345'
      },
      body: JSON.stringify({
        title: 'Test Note with Invalid CSRF'
      })
    });

    if (invalidResponse.status === 403) {
      results.invalidToken.success++;
      console.log('✅ Request with invalid CSRF token properly rejected (403)');
    } else {
      console.log('❌ Request with invalid CSRF token not rejected:', invalidResponse.status);
    }

    // 3. Test without CSRF token
    console.log('\n3️⃣ Testing without CSRF token...');
    results.noToken.total++;
    
    const noTokenResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No CSRF token
      },
      body: JSON.stringify({
        title: 'Test Note without CSRF'
      })
    });

    if (noTokenResponse.status === 403) {
      results.noToken.success++;
      console.log('✅ Request without CSRF token properly rejected (403)');
    } else {
      console.log('⚠️ Request without CSRF token accepted (development mode):', noTokenResponse.status);
    }

    // 4. Test multiple routes with invalid tokens
    console.log('\n4️⃣ Testing multiple routes with invalid tokens...');
    
    const routesToTest = [
      { name: 'Notes', url: '/api/notes', method: 'POST', body: { title: 'Test' } },
      { name: 'Email', url: '/api/send-email', method: 'POST', body: { to: 'test@example.com', subject: 'Test', body: 'Test' } },
      { name: 'Profile Update', url: '/api/profile/update', method: 'POST', body: { user_id: 'test', first_name: 'Test' } },
      { name: 'Investments', url: '/api/investments', method: 'POST', body: { userId: 'test', packageId: 'test', amount: 1000 } }
    ];

    for (const route of routesToTest) {
      const response = await fetch(`${BASE_URL}${route.url}`, {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token-12345'
        },
        body: JSON.stringify(route.body)
      });

      if (response.status === 403) {
        console.log(`✅ ${route.name} properly rejects invalid CSRF token`);
      } else {
        console.log(`❌ ${route.name} accepts invalid CSRF token (status: ${response.status})`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Report
  console.log('\n📊 INVALID TOKEN TEST RESULTS');
  console.log('==============================');
  console.log(`Valid Token: ${results.validToken.success}/${results.validToken.total}`);
  console.log(`Invalid Token: ${results.invalidToken.success}/${results.invalidToken.total}`);
  console.log(`No Token: ${results.noToken.success}/${results.noToken.total}`);

  const totalTests = results.validToken.total + results.invalidToken.total + results.noToken.total;
  const totalSuccess = results.validToken.success + results.invalidToken.success + results.noToken.success;

  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);
  
  if (results.invalidToken.success === results.invalidToken.total) {
    console.log('🎉 CSRF protection is working correctly - invalid tokens are rejected!');
  } else {
    console.log('⚠️ CSRF protection needs attention - some invalid tokens are accepted');
  }
}

testCSRFInvalidTokens(); 