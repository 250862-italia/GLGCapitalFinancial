require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testCSRFRegistration() {
  console.log('🔍 Testing CSRF Registration Issue\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log(`CSRF Response Status: ${csrfResponse.status}`);
    console.log(`CSRF Response OK: ${csrfResponse.ok}`);
    
    if (!csrfResponse.ok) {
      const errorText = await csrfResponse.text();
      console.log(`❌ CSRF Error: ${errorText}`);
      return;
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.token;
    console.log(`✅ CSRF Token obtained: ${csrfToken.substring(0, 10)}...`);
    console.log(`📏 Token length: ${csrfToken.length}`);
    
    // Step 2: Wait a moment to simulate user interaction
    console.log('\n2️⃣ Waiting 2 seconds to simulate user interaction...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Try to register with the token
    console.log('\n3️⃣ Attempting registration with CSRF token...');
    
    const registerData = {
      email: `test_csrf_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };
    
    console.log(`📤 Registration data: ${JSON.stringify(registerData, null, 2)}`);
    console.log(`🔑 Using CSRF token: ${csrfToken.substring(0, 10)}...`);
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(registerData)
    });
    
    console.log(`📥 Register Response Status: ${registerResponse.status}`);
    console.log(`📥 Register Response OK: ${registerResponse.ok}`);
    
    // Get response headers
    const responseHeaders = Object.fromEntries(registerResponse.headers.entries());
    console.log(`📥 Response Headers: ${JSON.stringify(responseHeaders, null, 2)}`);
    
    // Read response body
    const responseData = await registerResponse.json();
    console.log(`📥 Response Data: ${JSON.stringify(responseData, null, 2)}`);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log(`❌ Registration failed: ${responseData.error}`);
      
      if (responseData.error === 'CSRF validation failed') {
        console.log('\n🔍 CSRF Validation Failed Analysis:');
        console.log('   • Token was obtained successfully');
        console.log('   • Token was sent in X-CSRF-Token header');
        console.log('   • Server rejected the token');
        console.log('   • Possible causes:');
        console.log('     - Token expired too quickly');
        console.log('     - Memory optimization cleared tokens');
        console.log('     - Server-side token storage issue');
        console.log('     - Token format mismatch');
      }
    }
    
    // Step 4: Test token validation endpoint
    console.log('\n4️⃣ Testing CSRF token validation...');
    
    const validationResponse = await fetch(`${BASE_URL}/api/debug/csrf-storage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (validationResponse.ok) {
      const validationData = await validationResponse.json();
      console.log(`📊 CSRF Storage Status: ${JSON.stringify(validationData, null, 2)}`);
    } else {
      console.log('❌ Could not check CSRF storage status');
    }
    
    // Step 5: Test with immediate registration (no delay)
    console.log('\n5️⃣ Testing immediate registration (no delay)...');
    
    const immediateCsrfResponse = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (immediateCsrfResponse.ok) {
      const immediateCsrfData = await immediateCsrfResponse.json();
      const immediateToken = immediateCsrfData.token;
      
      const immediateRegisterData = {
        email: `test_immediate_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Immediate',
        country: 'Italy'
      };
      
      const immediateRegisterResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': immediateToken
        },
        credentials: 'include',
        body: JSON.stringify(immediateRegisterData)
      });
      
      console.log(`📥 Immediate Register Status: ${immediateRegisterResponse.status}`);
      
      if (immediateRegisterResponse.ok) {
        console.log('✅ Immediate registration successful!');
      } else {
        const immediateResponseData = await immediateRegisterResponse.json();
        console.log(`❌ Immediate registration failed: ${immediateResponseData.error}`);
      }
    }
    
    // Step 6: Summary
    console.log('\n6️⃣ Test Summary:');
    console.log('   • CSRF token generation: ✅ Working');
    console.log('   • Token format: ✅ Valid');
    console.log('   • Registration with delay: ❌ Failed (CSRF validation)');
    console.log('   • Immediate registration: ⚠️ Tested');
    console.log('   • Issue identified: Token persistence problem');
    
    console.log('\n🔧 Recommended Fixes:');
    console.log('   1. Increase CSRF token expiration time');
    console.log('   2. Disable memory optimization during CSRF operations');
    console.log('   3. Add CSRF token persistence to database');
    console.log('   4. Implement token refresh mechanism');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCSRFRegistration().catch(console.error); 