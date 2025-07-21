// Test script to debug CSRF token issues
const fetch = require('node-fetch');

async function testCSRF() {
  console.log('🔍 Testing CSRF token functionality...\n');

  try {
    // Step 1: Get a CSRF token
    console.log('1️⃣ Fetching CSRF token...');
    const tokenResponse = await fetch('http://localhost:3000/api/csrf', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get CSRF token: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ CSRF token received:', tokenData.token.substring(0, 10) + '...');
    console.log('   Expires in:', tokenData.expiresIn, 'seconds\n');

    // Step 2: Test using the token in a request
    console.log('2️⃣ Testing CSRF token in a request...');
    const testResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': tokenData.token,
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword',
      }),
    });

    console.log('   Response status:', testResponse.status);
    const responseText = await testResponse.text();
    console.log('   Response body:', responseText.substring(0, 200) + '...\n');

    // Step 3: Test without CSRF token (should fail)
    console.log('3️⃣ Testing request without CSRF token (should fail)...');
    const noTokenResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword',
      }),
    });

    console.log('   Response status:', noTokenResponse.status);
    const noTokenText = await noTokenResponse.text();
    console.log('   Response body:', noTokenText.substring(0, 200) + '...\n');

    // Step 4: Test admin login with CSRF
    console.log('4️⃣ Testing admin login with CSRF token...');
    const adminResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': tokenData.token,
      },
      body: JSON.stringify({
        email: 'admin@glgcapital.com',
        password: 'admin123',
      }),
    });

    console.log('   Admin response status:', adminResponse.status);
    const adminText = await adminResponse.text();
    console.log('   Admin response body:', adminText.substring(0, 200) + '...\n');

    console.log('🎉 CSRF test completed!');

  } catch (error) {
    console.error('❌ Error during CSRF test:', error.message);
  }
}

// Run the test
testCSRF(); 