const BASE_URL = 'http://localhost:3000';

async function testRegistrationFix() {
  console.log('🔧 Testing Registration Fix - User Scenario');
  console.log('===========================================');
  
  try {
    // Simulate the exact user scenario
    console.log('\n1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log('CSRF Response Status:', csrfResponse.status);
    console.log('CSRF Response OK:', csrfResponse.ok);

    if (!csrfResponse.ok) {
      const errorText = await csrfResponse.text();
      console.log('❌ CSRF Error:', errorText);
      throw new Error(`Failed to get CSRF token: ${csrfResponse.status} - ${errorText}`);
    }

    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF Token obtained:', csrfData.token.substring(0, 10) + '...');

    // Test registration with the exact data from user's error
    console.log('\n2️⃣ Testing registration with user data...');
    
    const userData = {
      email: "g.innocenti@magnificusdominus.com",
      password: "Nncgnn62*",
      firstName: "gianni",
      lastName: "info@washtw.com",
      country: "Italy"
    };

    console.log('📤 Data to send:', JSON.stringify(userData, null, 2));

    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    console.log('📥 Register Response Status:', registerResponse.status);
    console.log('📥 Register Response OK:', registerResponse.ok);
    console.log('📥 Register Response Status Text:', registerResponse.statusText);

    // Get response headers
    const responseHeaders = Object.fromEntries(registerResponse.headers.entries());
    console.log('📥 Response Headers:', JSON.stringify(responseHeaders, null, 2));

    // Read response body
    const responseData = await registerResponse.json();
    console.log('📥 Response Data:', JSON.stringify(responseData, null, 2));

    if (registerResponse.ok) {
      console.log('✅ Registration completed successfully!');
    } else {
      console.log('❌ Registration failed:', responseData.error);
    }

    // Test with a different email to avoid conflicts
    console.log('\n3️⃣ Testing registration with new email...');
    
    const newUserData = {
      email: "test_" + Date.now() + "@example.com",
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
      country: "Italy"
    };

    const registerResponse2 = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      credentials: 'include',
      body: JSON.stringify(newUserData)
    });

    const responseData2 = await registerResponse2.json();
    console.log('📥 Second Registration Status:', registerResponse2.status);
    console.log('📥 Second Registration Data:', responseData2.error || 'Success');

    if (registerResponse2.ok) {
      console.log('✅ Second registration completed successfully!');
    } else {
      console.log('❌ Second registration failed:', responseData2.error);
    }

  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

testRegistrationFix(); 