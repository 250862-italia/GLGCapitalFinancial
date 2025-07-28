const fs = require('fs');
const path = require('path');

async function testSimpleUpload() {
  console.log('📸 Test Upload Semplice\n');

  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf');
    const csrfData = await csrfResponse.json();
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    console.log('✅ CSRF token obtained');
    
    // Step 2: Create a simple test image
    console.log('\n2️⃣ Creating test image...');
    const testImagePath = path.join(__dirname, 'test-simple.jpg');
    
    // Create a simple 1x1 pixel JPEG
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
      0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegData);
    console.log('✅ Test image created');
    
    // Step 3: Test upload with FormData
    console.log('\n3️⃣ Testing upload with FormData...');
    
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    
    const formData = new FormData();
    const blob = new Blob([jpegData], { type: 'image/jpeg' });
    formData.append('photo', blob, 'test-simple.jpg');
    formData.append('user_id', testUserId);
    
    console.log('📝 Sending upload request...');
    console.log('   User ID:', testUserId);
    console.log('   File size:', jpegData.length, 'bytes');
    
    const uploadResponse = await fetch('http://localhost:3000/api/profile/upload-photo', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
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
    }
    
    // Clean up
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Test image cleaned up');
    }
    
    console.log('\n🎯 Test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSimpleUpload().catch(console.error); 