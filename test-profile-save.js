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
  
  const data = await response.json();
  return { response, data };
}

async function testProfileSave() {
  console.log('🧪 Testing profile save functionality...\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error('❌ Failed to get CSRF token:', csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    
    // Step 2: Test profile update
    console.log('\n2️⃣ Testing profile update...');
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2'; // Use existing user ID from logs
    
    const profileData = {
      user_id: testUserId,
      first_name: 'Test',
      last_name: 'User',
      phone: '+39 123 456 7890',
      company: 'Test Company',
      position: 'Manager',
      address: 'Via Roma 123',
      city: 'Milano',
      country: 'Italy',
      postal_code: '20100',
      annual_income: 50000,
      net_worth: 100000,
      investment_experience: 'intermediate',
      risk_tolerance: 'medium'
    };
    
    const { response: updateResponse, data: updateResult } = await makeRequest(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(profileData)
    });
    
    console.log('📊 Profile Update Response:', {
      status: updateResponse.status,
      success: updateResult.success,
      message: updateResult.message,
      warning: updateResult.warning
    });
    
    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Profile update successful!');
      if (updateResult.data) {
        console.log('📝 Updated data:', updateResult.data);
      }
    } else {
      console.log('❌ Profile update failed:', updateResult);
    }
    
    // Step 3: Test photo upload
    console.log('\n3️⃣ Testing photo upload...');
    
    // Create a simple test image
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    const blob = Buffer.from(testImageData.split(',')[1], 'base64');
    
    const formData = new FormData();
    formData.append('photo', new Blob([blob], { type: 'image/jpeg' }), 'test.jpg');
    formData.append('user_id', testUserId);
    
    const { response: photoResponse, data: photoResult } = await makeRequest(`${BASE_URL}/api/profile/upload-photo`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: formData
    });
    
    console.log('📊 Photo Upload Response:', {
      status: photoResponse.status,
      success: photoResult.success,
      message: photoResult.message,
      photoUrl: photoResult.photo_url
    });
    
    if (photoResponse.ok && photoResult.success) {
      console.log('✅ Photo upload successful!');
    } else {
      console.log('❌ Photo upload failed:', photoResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileSave(); 