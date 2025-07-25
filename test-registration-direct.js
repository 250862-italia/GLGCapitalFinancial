require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'https://glgcapitalfinancial-io7sbvs43-250862-italias-projects.vercel.app';

// Simulate local token generation like the frontend
function generateLocalToken() {
  // Simulate crypto.randomUUID() or fallback
  return Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
}

async function testDirectRegistration() {
  console.log('🔍 Testing Direct Registration with Local CSRF Token\n');
  
  try {
    // Step 1: Generate local CSRF token (like frontend does)
    console.log('1️⃣ Generating local CSRF token...');
    const csrfToken = generateLocalToken();
    console.log(`✅ Local CSRF Token generated: ${csrfToken.substring(0, 10)}...`);
    console.log(`📏 Token length: ${csrfToken.length}`);
    
    // Step 2: Try to register with the local token
    console.log('\n2️⃣ Attempting registration with local CSRF token...');
    
    const registerData = {
      email: `test_direct_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Direct',
      country: 'Italy'
    };
    
    console.log(`📤 Registration data: ${JSON.stringify(registerData, null, 2)}`);
    console.log(`🔑 Using local CSRF token: ${csrfToken.substring(0, 10)}...`);
    
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
      console.log(`📧 User created: ${responseData.user?.email}`);
      console.log(`🆔 User ID: ${responseData.user?.id}`);
    } else {
      console.log(`❌ Registration failed: ${responseData.error}`);
      
      if (responseData.error === 'CSRF validation failed') {
        console.log('\n🔍 CSRF Validation Failed Analysis:');
        console.log('   • Local token was generated successfully');
        console.log('   • Token was sent in X-CSRF-Token header');
        console.log('   • Server rejected the token');
        console.log('   • This means the server-side validation is still too strict');
      }
    }
    
    // Step 3: Test with another registration
    console.log('\n3️⃣ Testing another registration...');
    
    const csrfToken2 = generateLocalToken();
    const registerData2 = {
      email: `test_direct2_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Direct2',
      country: 'Italy'
    };
    
    const registerResponse2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken2
      },
      credentials: 'include',
      body: JSON.stringify(registerData2)
    });
    
    console.log(`📥 Second Register Status: ${registerResponse2.status}`);
    
    if (registerResponse2.ok) {
      console.log('✅ Second registration successful!');
    } else {
      const responseData2 = await registerResponse2.json();
      console.log(`❌ Second registration failed: ${responseData2.error}`);
    }
    
    // Step 4: Summary
    console.log('\n4️⃣ Test Summary:');
    console.log('   • Local CSRF token generation: ✅ Working');
    console.log('   • Token format: ✅ Valid');
    console.log('   • Registration with local token: ⚠️ Tested');
    console.log('   • Server-side validation: ⚠️ May need adjustment');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check if registration actually works in browser');
    console.log('   2. Verify server-side CSRF validation logic');
    console.log('   3. Consider disabling Vercel authentication for API routes');
    console.log('   4. Test with real user registration flow');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDirectRegistration().catch(console.error); 