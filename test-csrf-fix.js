require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001';

async function testCSRFFix() {
  console.log('🔐 Testing CSRF Fix - Token Storage Issue Resolution\n');

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

    // Step 2: Test login with CSRF token
    console.log('\n2️⃣ Testing login with CSRF token...');
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
    
    if (loginResponse.status === 403) {
      const errorData = await loginResponse.json();
      console.log('❌ CSRF validation failed:', errorData);
      
      if (errorData.error === 'CSRF validation failed' && 
          errorData.details === 'Invalid CSRF token (not found in storage)') {
        console.log('🔍 This confirms the token storage issue');
      }
    } else if (loginResponse.ok) {
      console.log('✅ Login successful (expected for invalid credentials)');
    } else {
      console.log('⚠️ Unexpected response:', loginResponse.status);
    }

    // Step 3: Test with a different endpoint
    console.log('\n3️⃣ Testing with notes endpoint...');
    const notesResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'Test Note',
        content: 'Test content'
      })
    });

    console.log('📥 Notes response status:', notesResponse.status);
    
    if (notesResponse.status === 403) {
      const errorData = await notesResponse.json();
      console.log('❌ CSRF validation failed on notes:', errorData);
    } else if (notesResponse.ok) {
      console.log('✅ Notes request successful');
    } else {
      console.log('⚠️ Unexpected notes response:', notesResponse.status);
    }

    // Step 4: Test token regeneration
    console.log('\n4️⃣ Testing token regeneration...');
    const newCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const newCsrfData = await newCsrfResponse.json();
    const newCsrfToken = newCsrfData.token;
    
    console.log('✅ New CSRF token obtained:', newCsrfToken.substring(0, 10) + '...');
    console.log('🔍 Tokens are different:', csrfToken !== newCsrfToken);

    console.log('\n🎯 CSRF Fix Test Complete');
    console.log('📋 Summary:');
    console.log('   - Token generation: ✅ Working');
    console.log('   - Token validation: ⚠️ Needs verification');
    console.log('   - Storage persistence: 🔍 Under investigation');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCSRFFix(); 