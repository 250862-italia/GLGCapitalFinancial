require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

async function makeFormDataRequest(url, formData, options = {}) {
  const response = await fetch(url, {
    headers: {
      ...options.headers
    },
    body: formData,
    ...options
  });
  
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function testProfileSave() {
  console.log('🔧 TESTING PROFILE SAVE AND PHOTO UPLOAD\n');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // STEP 2: Login with test user
    console.log('\n2️⃣ Logging in with test user...');
    const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: 'innocentigianni2015@gmail.com',
        password: 'TestPassword123!'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginData);
      return;
    }

    console.log('✅ Login successful');
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');

    // STEP 3: Test profile data update
    console.log('\n3️⃣ Testing profile data update...');
    const testData = {
      user_id: loginData.user.id,
      first_name: 'Test Updated',
      last_name: 'User Updated',
      phone: '+1234567890',
      company: 'Test Company',
      position: 'Test Position',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      postal_code: '12345',
      annual_income: 50000,
      net_worth: 100000,
      investment_experience: 'intermediate',
      risk_tolerance: 'medium'
    };

    const { response: updateResponse, data: updateData } = await makeRequest(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      },
      body: JSON.stringify(testData)
    });

    console.log('📝 Update response status:', updateResponse.status);
    console.log('📝 Update response data:', updateData);

    if (updateResponse.ok) {
      console.log('✅ Profile data update successful');
    } else {
      console.log('❌ Profile data update failed');
    }

    // STEP 4: Test photo upload
    console.log('\n4️⃣ Testing photo upload...');
    
    // Create a simple test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.log('📸 Creating test image...');
      // Create a minimal JPEG file for testing
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
        0x07, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJpeg);
    }

    // Read the file and create a Blob
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('user_id', loginData.user.id);
    formData.append('photo', imageBlob, 'test-image.jpg');

    const { response: photoResponse, data: photoData } = await makeFormDataRequest(`${BASE_URL}/api/profile/upload-photo`, formData, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      }
    });

    console.log('📸 Photo upload response status:', photoResponse.status);
    console.log('📸 Photo upload response data:', photoData);

    if (photoResponse.ok) {
      console.log('✅ Photo upload successful');
    } else {
      console.log('❌ Photo upload failed');
    }

    // STEP 5: Verify data in database
    console.log('\n5️⃣ Verifying data in database...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', loginData.user.id)
      .single();

    if (clientError) {
      console.log('❌ Error fetching client data:', clientError);
    } else {
      console.log('✅ Client data found in database');
      console.log('📝 Updated fields:');
      console.log('  - First Name:', clientData.first_name);
      console.log('  - Last Name:', clientData.last_name);
      console.log('  - Phone:', clientData.phone);
      console.log('  - Company:', clientData.company);
      console.log('  - Profile Photo:', clientData.profile_photo ? 'Yes' : 'No');
    }

    // STEP 6: Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`  - CSRF Token: ✅`);
    console.log(`  - Login: ${loginResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Profile Update: ${updateResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Photo Upload: ${photoResponse.ok ? '✅' : '❌'}`);
    console.log(`  - Database Verification: ${clientError ? '❌' : '✅'}`);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProfileSave(); 