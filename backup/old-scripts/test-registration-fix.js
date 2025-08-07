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
  
  const data = await response.json();
  return { response, data };
}

async function testRegistration() {
  console.log('🧪 Testing registration with client creation fix...\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error('❌ Failed to get CSRF token:', csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    
    // Step 2: Test registration
    console.log('\n2️⃣ Testing user registration...');
    const testEmail = `test_fix_${Date.now()}@example.com`;
    const userData = {
      email: testEmail,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      country: 'Italy'
    };
    
    const { response: registerResponse, data: registerResult } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(userData)
    });
    
    console.log('📊 Registration Response:', {
      status: registerResponse.status,
      success: registerResult.success,
      message: registerResult.message,
      profileCreated: registerResult.profileCreated,
      clientCreated: registerResult.clientCreated
    });
    
    if (registerResponse.ok && registerResult.success) {
      console.log('✅ Registration successful!');
      
      if (registerResult.clientCreated) {
        console.log('✅ Client record created successfully!');
      } else {
        console.log('⚠️ Client record creation failed');
      }
      
      if (registerResult.profileCreated) {
        console.log('✅ Profile record created successfully!');
      } else {
        console.log('⚠️ Profile record creation failed');
      }
    } else {
      console.log('❌ Registration failed:', registerResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRegistration(); 