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
  
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function debugLogin500() {
  console.log('🔍 DEBUGGING LOGIN 500 ERROR\n');
  
  try {
    // STEP 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.status !== 200) {
      console.log('❌ Failed to get CSRF token:', csrfResponse.status);
      return;
    }

    const csrfToken = csrfData.token;
    console.log('✅ CSRF token obtained:', csrfToken.substring(0, 10) + '...');

    // STEP 2: Test with various scenarios that might cause 500
    const testCases = [
      {
        name: 'Empty email',
        data: { email: '', password: 'TestPassword123!' }
      },
      {
        name: 'Empty password',
        data: { email: 'innocentigianni2015@gmail.com', password: '' }
      },
      {
        name: 'Invalid email format',
        data: { email: 'invalid-email', password: 'TestPassword123!' }
      },
      {
        name: 'Very long email',
        data: { email: 'a'.repeat(300) + '@example.com', password: 'TestPassword123!' }
      },
      {
        name: 'Very long password',
        data: { email: 'innocentigianni2015@gmail.com', password: 'a'.repeat(1000) }
      },
      {
        name: 'Special characters in email',
        data: { email: 'test+test@example.com', password: 'TestPassword123!' }
      },
      {
        name: 'Null values',
        data: { email: null, password: null }
      },
      {
        name: 'Undefined values',
        data: { email: undefined, password: undefined }
      },
      {
        name: 'Extra fields',
        data: { 
          email: 'innocentigianni2015@gmail.com', 
          password: 'TestPassword123!',
          extraField: 'should be ignored'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n2️⃣ Testing: ${testCase.name}`);
      
      const { response, data } = await makeRequest(
        `${BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(testCase.data)
        }
      );

      console.log(`📊 Status: ${response.status}`);
      console.log('📄 Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 500) {
        console.log('🔍 FOUND 500 ERROR! This might be the cause.');
      }
    }

    // STEP 3: Test with correct credentials to ensure it still works
    console.log('\n3️⃣ Testing with correct credentials...');
    const { response: correctResponse, data: correctData } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          email: 'innocentigianni2015@gmail.com',
          password: 'TestPassword123!'
        })
      }
    );

    console.log(`📊 Correct credentials status: ${correctResponse.status}`);
    if (correctResponse.status === 200) {
      console.log('✅ Correct credentials still work');
    } else {
      console.log('❌ Correct credentials failed:', JSON.stringify(correctData, null, 2));
    }

    // STEP 4: Test without CSRF token
    console.log('\n4️⃣ Testing without CSRF token...');
    const { response: noCsrfResponse, data: noCsrfData } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'innocentigianni2015@gmail.com',
          password: 'TestPassword123!'
        })
      }
    );

    console.log(`📊 No CSRF status: ${noCsrfResponse.status}`);
    console.log('📄 No CSRF response:', JSON.stringify(noCsrfData, null, 2));

    // SUMMARY
    console.log('\n📊 DEBUG SUMMARY:');
    console.log('✅ All test cases completed');
    console.log('🔍 Check above for any 500 errors');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugLogin500(); 