// Browser CSRF Debug Test
// Run this in the browser console to test CSRF token functionality

async function debugCSRFInBrowser() {
  console.log('🔍 Debugging CSRF in Browser...');
  
  try {
    // Step 1: Test direct CSRF token fetch
    console.log('1️⃣ Testing direct CSRF token fetch...');
    const csrfResponse = await fetch('/api/csrf');
    console.log('CSRF Response status:', csrfResponse.status);
    
    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();
      console.log('✅ CSRF Token received:', csrfData.token.substring(0, 10) + '...');
      
      // Step 2: Test registration with the token
      console.log('2️⃣ Testing registration with CSRF token...');
      const registerData = {
        email: `test_browser_${Date.now()}@example.com`,
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      };
      
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        body: JSON.stringify(registerData)
      });
      
      console.log('Registration response status:', registerResponse.status);
      const registerResult = await registerResponse.json();
      console.log('Registration result:', registerResult);
      
      if (registerResponse.ok) {
        console.log('✅ Registration SUCCESS with CSRF token');
      } else {
        console.log('❌ Registration FAILED:', registerResult.error);
      }
      
    } else {
      console.log('❌ Failed to get CSRF token');
    }
    
  } catch (error) {
    console.error('❌ Error during CSRF test:', error);
  }
}

// Test the CSRF client import
async function testCSRFClient() {
  console.log('🔍 Testing CSRF Client import...');
  
  try {
    // Try to import the CSRF client
    const { fetchJSONWithCSRF } = await import('/lib/csrf-client.js');
    console.log('✅ CSRF Client imported successfully');
    
    // Test registration using CSRF client
    console.log('🔄 Testing registration with CSRF client...');
    const registerData = {
      email: `test_client_${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };
    
    const response = await fetchJSONWithCSRF('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
    
    console.log('CSRF Client response status:', response.status);
    const result = await response.json();
    console.log('CSRF Client result:', result);
    
  } catch (error) {
    console.error('❌ CSRF Client test failed:', error);
  }
}

// Run both tests
console.log('🚀 Starting CSRF Browser Tests...');
debugCSRFInBrowser().then(() => {
  console.log('📋 Direct CSRF test completed');
  return testCSRFClient();
}).then(() => {
  console.log('📋 CSRF Client test completed');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
}); 