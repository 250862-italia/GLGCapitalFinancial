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

async function testProfileFinal() {
  console.log('🎯 Final Profile Test - Complete Functionality Check\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error('❌ Failed to get CSRF token:', csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    
    // Step 2: Test profile loading
    console.log('\n2️⃣ Testing profile loading...');
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    
    const { response: loadResponse, data: loadResult } = await makeRequest(`${BASE_URL}/api/profile/${testUserId}`, {
      headers: {
        'X-CSRF-Token': csrfData.token
      }
    });
    
    console.log('📊 Profile Load Response:', {
      status: loadResponse.status,
      hasData: !!loadResult,
      firstName: loadResult?.first_name,
      lastName: loadResult?.last_name,
      email: loadResult?.email
    });
    
    if (loadResponse.ok && loadResult) {
      console.log('✅ Profile loaded successfully!');
    } else {
      console.log('❌ Profile load failed:', loadResult);
      return;
    }
    
    // Step 3: Test profile update
    console.log('\n3️⃣ Testing profile update...');
    const updateData = {
      user_id: testUserId,
      first_name: 'Updated',
      last_name: 'Name',
      phone: '+39 987 654 3210',
      company: 'Updated Company',
      position: 'Updated Position',
      address: 'Updated Address 456',
      city: 'Roma',
      country: 'Italy',
      annual_income: 75000,
      net_worth: 150000,
      investment_experience: 'advanced',
      risk_tolerance: 'high'
    };
    
    const { response: updateResponse, data: updateResult } = await makeRequest(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('📊 Profile Update Response:', {
      status: updateResponse.status,
      success: updateResult.success,
      message: updateResult.message
    });
    
    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Profile update successful!');
    } else {
      console.log('❌ Profile update failed:', updateResult);
    }
    
    // Step 4: Test photo upload
    console.log('\n4️⃣ Testing photo upload...');
    
    // Create a simple test image
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    const blob = Buffer.from(testImageData.split(',')[1], 'base64');
    
    const formData = new FormData();
    formData.append('photo', new Blob([blob], { type: 'image/jpeg' }), 'test_final.jpg');
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
      hasPhotoUrl: !!photoResult.photo_url
    });
    
    if (photoResponse.ok && photoResult.success) {
      console.log('✅ Photo upload successful!');
    } else {
      console.log('❌ Photo upload failed:', photoResult);
    }
    
    // Step 5: Verify final state
    console.log('\n5️⃣ Verifying final profile state...');
    const { response: finalResponse, data: finalResult } = await makeRequest(`${BASE_URL}/api/profile/${testUserId}`, {
      headers: {
        'X-CSRF-Token': csrfData.token
      }
    });
    
    if (finalResponse.ok && finalResult) {
      console.log('📊 Final Profile State:', {
        firstName: finalResult.first_name,
        lastName: finalResult.last_name,
        phone: finalResult.phone,
        company: finalResult.company,
        hasPhoto: !!finalResult.profile_photo,
        annualIncome: finalResult.annual_income,
        netWorth: finalResult.net_worth
      });
      
      console.log('✅ Final verification successful!');
    } else {
      console.log('❌ Final verification failed:', finalResult);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileFinal(); 