const BASE_URL = 'http://localhost:3000';

async function debugCSRF() {
  console.log('🔍 CSRF Debug Analysis');
  console.log('======================');
  
  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Testing CSRF token generation...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ CSRF token generation failed');
      return;
    }
    
    console.log('✅ CSRF token generated:', csrfData.token.substring(0, 10) + '...');
    
    // 2. Test token in header
    console.log('\n2️⃣ Testing CSRF token in header...');
    const headerResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Header test status:', headerResponse.status);
    const headerData = await headerResponse.json();
    console.log('Header test response:', headerData);
    
    // 3. Test token in query params
    console.log('\n3️⃣ Testing CSRF token in query params...');
    const queryResponse = await fetch(`${BASE_URL}/api/auth/login?csrf=${csrfData.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Query test status:', queryResponse.status);
    const queryData = await queryResponse.json();
    console.log('Query test response:', queryData);
    
    // 4. Test without token
    console.log('\n4️⃣ Testing without CSRF token...');
    const noTokenResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('No token test status:', noTokenResponse.status);
    const noTokenData = await noTokenResponse.json();
    console.log('No token test response:', noTokenData);
    
    // 5. Test with invalid token
    console.log('\n5️⃣ Testing with invalid CSRF token...');
    const invalidResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-123'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Invalid token test status:', invalidResponse.status);
    const invalidData = await invalidResponse.json();
    console.log('Invalid token test response:', invalidData);
    
    // 6. Check server logs
    console.log('\n6️⃣ Checking server token storage...');
    const storageResponse = await fetch(`${BASE_URL}/api/debug/csrf-storage`);
    if (storageResponse.ok) {
      const storageData = await storageResponse.json();
      console.log('Token storage info:', storageData);
    } else {
      console.log('Storage endpoint not available');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugCSRF(); 