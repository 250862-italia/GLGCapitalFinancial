require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001';

async function testLoginAfterFix() {
  console.log('🔐 Testing Login After Database Fix\n');

  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token:', csrfResponse.status);
      return;
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.token;
    
    if (!csrfToken) {
      console.log('❌ No CSRF token in response');
      return;
    }
    
    console.log('✅ CSRF token obtained:', csrfToken.substring(0, 10) + '...');

    // Step 2: Test login with valid credentials (if you have them)
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('📥 Login response status:', loginResponse.status);
    
    const loginData = await loginResponse.json();
    console.log('📥 Login response data:', loginData);

    if (loginResponse.status === 401) {
      console.log('✅ Login working correctly - 401 for invalid credentials (expected)');
      console.log('✅ CSRF validation passed - no more 403 CSRF errors!');
    } else if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
    } else if (loginResponse.status === 500) {
      console.log('❌ Still getting 500 error - database issue persists');
      console.log('🔧 You need to run the SQL script in Supabase dashboard');
    } else {
      console.log('⚠️ Unexpected response:', loginResponse.status);
    }

    // Step 3: Test registration to see if it works
    console.log('\n3️⃣ Testing registration...');
    const testEmail = `test_user_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });

    console.log('📥 Registration response status:', registerResponse.status);
    
    const registerData = await registerResponse.json();
    console.log('📥 Registration response data:', registerData);

    if (registerResponse.status === 200) {
      console.log('✅ Registration working correctly!');
    } else if (registerResponse.status === 500) {
      console.log('❌ Registration still has database issues');
    } else {
      console.log('⚠️ Unexpected registration response:', registerResponse.status);
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - CSRF Token: ✅ Working');
    console.log('   - Login API: ⚠️ Check status above');
    console.log('   - Registration API: ⚠️ Check status above');
    console.log('   - Database: 🔧 May need SQL script execution');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLoginAfterFix(); 