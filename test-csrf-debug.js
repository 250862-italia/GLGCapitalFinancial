const BASE_URL = 'http://localhost:3000';

async function debugCSRFIssue() {
  console.log('🔍 CSRF Debug - Identifying Validation Failures');
  console.log('===============================================');
  
  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Testing CSRF token generation...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ CSRF token generation failed');
      console.log('Response status:', csrfResponse.status);
      console.log('Response data:', csrfData);
      return;
    }
    
    console.log('✅ CSRF token generated:', csrfData.token.substring(0, 10) + '...');
    
    // 2. Test token extraction from header
    console.log('\n2️⃣ Testing token extraction from header...');
    const headerResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        title: 'Test Note with Header Token'
      })
    });
    
    console.log('Header test status:', headerResponse.status);
    const headerData = await headerResponse.json();
    console.log('Header test response:', headerData);
    
    // 3. Test token extraction from query params
    console.log('\n3️⃣ Testing token extraction from query params...');
    const queryResponse = await fetch(`${BASE_URL}/api/notes?csrf=${csrfData.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Note with Query Token'
      })
    });
    
    console.log('Query test status:', queryResponse.status);
    const queryData = await queryResponse.json();
    console.log('Query test response:', queryData);
    
    // 4. Test without token (should fail in production, might work in dev)
    console.log('\n4️⃣ Testing without CSRF token...');
    const noTokenResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Note without Token'
      })
    });
    
    console.log('No token test status:', noTokenResponse.status);
    const noTokenData = await noTokenResponse.json();
    console.log('No token test response:', noTokenData);
    
    // 5. Test with invalid token
    console.log('\n5️⃣ Testing with invalid CSRF token...');
    const invalidResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-12345'
      },
      body: JSON.stringify({
        title: 'Test Note with Invalid Token'
      })
    });
    
    console.log('Invalid token test status:', invalidResponse.status);
    const invalidData = await invalidResponse.json();
    console.log('Invalid token test response:', invalidData);
    
    // 6. Test multiple routes
    console.log('\n6️⃣ Testing multiple API routes...');
    const routes = [
      { name: 'Notes', url: '/api/notes', method: 'POST', body: { title: 'Test' } },
      { name: 'Profile Update', url: '/api/profile/update', method: 'POST', body: { user_id: 'test', first_name: 'Test' } },
      { name: 'Send Email', url: '/api/send-email', method: 'POST', body: { to: 'test@example.com', subject: 'Test', body: 'Test' } },
      { name: 'Investments', url: '/api/investments', method: 'POST', body: { userId: 'test', packageId: 'test', amount: 1000 } }
    ];
    
    for (const route of routes) {
      console.log(`\nTesting ${route.name}...`);
      
      // Get fresh token for each test
      const freshCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
      const freshCsrfData = await freshCsrfResponse.json();
      
      const response = await fetch(`${BASE_URL}${route.url}`, {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': freshCsrfData.token
        },
        body: JSON.stringify(route.body)
      });
      
      console.log(`${route.name} status:`, response.status);
      const data = await response.json();
      console.log(`${route.name} response:`, data);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugCSRFIssue(); 