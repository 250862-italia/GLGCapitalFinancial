const fetch = require('node-fetch');

async function testProfileSave() {
  console.log('🧪 Test Profile Save\n');

  try {
    // Test 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf');
    const csrfData = await csrfResponse.json();
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    console.log('✅ CSRF token obtained');

    // Test 2: Test profile update
    console.log('\n2️⃣ Testing profile update...');
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    const updateData = {
      user_id: testUserId,
      nationality: 'italian',
      company: 'Test Company',
      phone: '123456789'
    };

    const updateResponse = await fetch('http://localhost:3000/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    console.log(`Update Response Status: ${updateResponse.status}`);
    console.log(`Update Success: ${updateResult.success}`);
    
    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Profile update successful');
      console.log('📝 Updated data:', updateResult.data);
    } else {
      console.log('❌ Profile update failed');
      console.log('Error:', updateResult.error);
    }

    // Test 3: Test photo upload
    console.log('\n3️⃣ Testing photo upload...');
    const testImagePath = require('path').join(__dirname, 'test-photo.jpg');
    const fs = require('fs');
    
    // Create a simple test image
    const jpegData = Buffer.from([
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
      0x00, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegData);
    console.log('✅ Test image created');

    const formData = new FormData();
    const blob = new Blob([jpegData], { type: 'image/jpeg' });
    formData.append('photo', blob, 'test-photo.jpg');
    formData.append('user_id', testUserId);

    const photoResponse = await fetch('http://localhost:3000/api/profile/upload-photo', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
        // Note: Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData
    });

    const photoResult = await photoResponse.json();
    console.log(`Photo Upload Response Status: ${photoResponse.status}`);
    console.log(`Photo Upload Success: ${photoResult.success}`);
    
    if (photoResponse.ok && photoResult.success) {
      console.log('✅ Photo upload successful');
      console.log('📸 Photo URL:', photoResult.photo_url);
    } else {
      console.log('❌ Photo upload failed');
      console.log('Error:', photoResult.error);
    }

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Test image cleaned up');
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProfileSave().catch(console.error); 