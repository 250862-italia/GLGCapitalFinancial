const BASE_URL = 'http://localhost:3000';

async function testCSRF() {
  console.log('🔧 Testing CSRF Token Flow');
  console.log('==========================');
  
  try {
    // 1. Get CSRF token
    console.log('\n1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf');
    const csrfData = await csrfResponse.json();
    
    console.log('CSRF Response Status:', csrfResponse.status);
    console.log('CSRF Response OK:', csrfResponse.ok);
    console.log('CSRF Token:', csrfData.token ? csrfData.token.substring(0, 10) + '...' : 'No token');
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    // 2. Test registration with CSRF token
    console.log('\n2️⃣ Testing registration with CSRF token...');
    const testEmail = 'test_' + Date.now() + '@example.com';
    
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
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
    
    const registerData = await registerResponse.json();
    
    console.log('Register Response Status:', registerResponse.status);
    console.log('Register Response OK:', registerResponse.ok);
    console.log('Register Response Data:', registerData);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

testCSRF(); 