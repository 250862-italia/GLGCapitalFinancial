require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

async function testLoginExistingUser() {
  console.log('🔐 Testing Login with Existing User\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const testEmail = 'innocentigianni2015@gmail.com';
  const testPassword = '123Admin';

  try {
    // Step 1: Get CSRF Token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.status !== 200) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    const csrfToken = csrfData.token;
    console.log('✅ CSRF token obtained:', csrfToken.substring(0, 10) + '...');

    // Step 2: Try Login
    console.log('\n2️⃣ Attempting login...');
    const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    console.log('📊 Login Response:');
    console.log('  Status:', loginResponse.status);
    console.log('  Data:', JSON.stringify(loginData, null, 2));

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
    } else if (loginResponse.status === 401) {
      console.log('❌ Login failed: Invalid credentials');
    } else if (loginResponse.status === 403) {
      console.log('❌ Login failed: CSRF validation failed');
    } else {
      console.log('❌ Login failed: Unexpected error');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testLoginExistingUser(); 