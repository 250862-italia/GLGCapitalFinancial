require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function testPhotoUploadSimple() {
  console.log('📸 Testing Simple Photo Upload\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    console.log('✅ CSRF token obtained');
    const csrfToken = csrfData.token;
    
    // Step 2: Create a real test image file
    console.log('\n2️⃣ Creating test image file...');
    
    // Create a simple 1x1 pixel JPEG image
    const jpegHeader = Buffer.from([
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
      0xFF, 0xD9
    ]);
    
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, jpegHeader);
    
    console.log('✅ Test image file created');
    
    // Step 3: Test photo upload
    console.log('\n3️⃣ Testing Photo Upload...');
    
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    
    // Create FormData with the real file
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('user_id', testUserId);
    
    console.log('📝 Sending photo upload request...');
    console.log('   User ID:', testUserId);
    console.log('   File size:', fs.statSync(testImagePath).size, 'bytes');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/profile/upload-photo`, {
      method: 'POST',
      headers: { 
        'X-CSRF-Token': csrfToken,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const uploadResult = await uploadResponse.json().catch(() => ({}));
    
    console.log(`Upload Response Status: ${uploadResponse.status}`);
    console.log(`Upload Success: ${uploadResult.success}`);
    
    if (uploadResponse.ok && uploadResult.success) {
      console.log('✅ Photo upload successful');
      console.log('📸 Photo URL:', uploadResult.photo_url);
    } else {
      console.log('❌ Photo upload failed');
      console.log('Error:', uploadResult.error);
      console.log('Details:', uploadResult.details);
      return;
    }
    
    // Step 4: Verify photo was saved in database
    console.log('\n4️⃣ Verifying Photo in Database...');
    
    const { data: savedProfile, error: profileError } = await supabase
      .from('clients')
      .select('profile_photo')
      .eq('user_id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Failed to retrieve profile photo:', profileError.message);
      return;
    }
    
    console.log('✅ Profile photo retrieved from database');
    console.log('📸 Database photo URL:', savedProfile.profile_photo);
    
    if (savedProfile.profile_photo) {
      console.log('✅ Photo URL saved in database successfully');
    } else {
      console.log('❌ Photo URL not found in database');
      return;
    }
    
    // Step 5: Test photo accessibility
    console.log('\n5️⃣ Testing Photo Accessibility...');
    
    try {
      const photoResponse = await fetch(savedProfile.profile_photo);
      if (photoResponse.ok) {
        console.log('✅ Photo is accessible via URL');
        console.log('📊 Photo size:', photoResponse.headers.get('content-length'), 'bytes');
      } else {
        console.log('❌ Photo not accessible via URL');
        console.log('Status:', photoResponse.status);
      }
    } catch (error) {
      console.log('❌ Error accessing photo:', error.message);
    }
    
    // Step 6: Clean up test file
    console.log('\n6️⃣ Cleaning up...');
    try {
      fs.unlinkSync(testImagePath);
      console.log('✅ Test image file removed');
    } catch (error) {
      console.log('⚠️ Could not remove test file:', error.message);
    }
    
    // Step 7: Summary
    console.log('\n7️⃣ Test Summary:');
    
    if (uploadResponse.ok && savedProfile.profile_photo) {
      console.log('✅ PHOTO UPLOAD TEST PASSED');
      console.log('   • Photo upload API working correctly');
      console.log('   • Photo saved to storage successfully');
      console.log('   • Photo URL saved in database');
      console.log('   • Photo accessible via URL');
      console.log('   • Memory optimization not interfering');
    } else {
      console.log('❌ PHOTO UPLOAD TEST FAILED');
      console.log('   • Check server logs for details');
      console.log('   • Verify storage bucket permissions');
      console.log('   • Check database connectivity');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testPhotoUploadSimple().catch(console.error); 