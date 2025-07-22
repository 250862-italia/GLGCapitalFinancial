const fetch = require('node-fetch');

async function debugCSRFRegistration() {
  console.log('🔍 Debugging CSRF Registration Flow\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch(`${baseUrl}/api/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.token;
    
    console.log('✅ CSRF Token received:', csrfToken.substring(0, 10) + '...');
    console.log('📊 Response status:', csrfResponse.status);
    console.log('📊 Response headers:', Object.fromEntries(csrfResponse.headers.entries()));
    
    // Step 2: Try registration WITH CSRF token
    console.log('\n2️⃣ Testing registration WITH CSRF token...');
    const registerData = {
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(registerData)
    });
    
    console.log('📊 Registration response status:', registerResponse.status);
    console.log('📊 Registration response headers:', Object.fromEntries(registerResponse.headers.entries()));
    
    const registerResult = await registerResponse.json();
    console.log('📊 Registration response body:', registerResult);
    
    if (registerResponse.ok) {
      console.log('✅ Registration WITH CSRF token: SUCCESS');
    } else {
      console.log('❌ Registration WITH CSRF token: FAILED');
    }
    
    // Step 3: Try registration WITHOUT CSRF token
    console.log('\n3️⃣ Testing registration WITHOUT CSRF token...');
    const registerData2 = {
      email: `test_${Date.now() + 1}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };
    
    const registerResponse2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No CSRF token
      },
      body: JSON.stringify(registerData2)
    });
    
    console.log('📊 Registration (no CSRF) response status:', registerResponse2.status);
    console.log('📊 Registration (no CSRF) response headers:', Object.fromEntries(registerResponse2.headers.entries()));
    
    const registerResult2 = await registerResponse2.json();
    console.log('📊 Registration (no CSRF) response body:', registerResult2);
    
    if (registerResponse2.status === 403) {
      console.log('✅ Registration WITHOUT CSRF token: CORRECTLY BLOCKED (403)');
    } else {
      console.log('❌ Registration WITHOUT CSRF token: SHOULD HAVE BEEN BLOCKED');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`- CSRF Token Generation: ${csrfResponse.ok ? '✅' : '❌'}`);
    console.log(`- Registration with CSRF: ${registerResponse.ok ? '✅' : '❌'}`);
    console.log(`- Registration without CSRF: ${registerResponse2.status === 403 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugCSRFRegistration(); 