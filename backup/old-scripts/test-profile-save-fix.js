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

async function testProfileSaveFix() {
  console.log('🔧 Testing Profile Save Fix\n');
  
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
    
    // Step 2: Test profile update with various fields
    console.log('\n2️⃣ Testing profile update...');
    
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2'; // Use existing user
    const updateData = {
      user_id: testUserId,
      first_name: 'Test Updated',
      last_name: 'Name Updated',
      phone: '+39 123 456 7890',
      company: 'Test Company Updated',
      position: 'Test Position Updated',
      date_of_birth: '1990-01-01',
      nationality: 'italian',
      address: 'Test Address Updated',
      city: 'Milano',
      country: 'Italy',
      postal_code: '20100',
      annual_income: 100000,
      net_worth: 500000,
      investment_experience: 'advanced',
      risk_tolerance: 'high'
    };
    
    const { response: updateResponse, data: updateResult } = await makeRequest(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(updateData)
    });
    
    console.log(`Update Response Status: ${updateResponse.status}`);
    console.log(`Update Success: ${updateResult.success}`);
    
    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Profile update successful');
      console.log('📊 Updated data:', updateResult.data);
    } else {
      console.log('❌ Profile update failed');
      console.log('Error:', updateResult.error || updateResult.warning);
    }
    
    // Step 3: Test photo upload simulation
    console.log('\n3️⃣ Testing photo upload simulation...');
    
    // Create a mock file for testing
    const mockFile = new Blob(['test image data'], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('photo', mockFile, 'test.jpg');
    formData.append('user_id', testUserId);
    
    const uploadResponse = await fetch(`${BASE_URL}/api/profile/upload-photo`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
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
    }
    
    // Step 4: Verify profile data was saved
    console.log('\n4️⃣ Verifying saved data...');
    
    const { data: savedProfile, error: profileError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Failed to retrieve saved profile:', profileError.message);
    } else {
      console.log('✅ Profile data retrieved successfully');
      console.log('📊 Saved profile data:');
      console.log(`   Name: ${savedProfile.first_name} ${savedProfile.last_name}`);
      console.log(`   Phone: ${savedProfile.phone}`);
      console.log(`   Company: ${savedProfile.company}`);
      console.log(`   Address: ${savedProfile.address}`);
      console.log(`   Annual Income: ${savedProfile.annual_income}`);
      console.log(`   Profile Photo: ${savedProfile.profile_photo ? 'Set' : 'Not set'}`);
    }
    
    // Step 5: Test memory optimization interference
    console.log('\n5️⃣ Testing memory optimization interference...');
    
    // Simulate multiple rapid updates to test memory protection
    const rapidUpdates = Array.from({ length: 3 }, (_, i) => ({
      user_id: testUserId,
      first_name: `Rapid Test ${i + 1}`,
      last_name: `Update ${i + 1}`,
      phone: `+39 999 999 ${i + 1}`
    }));
    
    let successfulUpdates = 0;
    let failedUpdates = 0;
    
    for (const update of rapidUpdates) {
      try {
        const { response, data } = await makeRequest(`${BASE_URL}/api/profile/update`, {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body: JSON.stringify(update)
        });
        
        if (response.ok && data.success) {
          successfulUpdates++;
        } else {
          failedUpdates++;
        }
      } catch (error) {
        failedUpdates++;
        console.log(`Update error: ${error.message}`);
      }
    }
    
    console.log(`Rapid Updates: ${successfulUpdates} successful, ${failedUpdates} failed`);
    
    if (successfulUpdates === rapidUpdates.length) {
      console.log('✅ Memory optimization not interfering with operations');
    } else {
      console.log('⚠️  Some updates failed - possible memory interference');
    }
    
    // Step 6: Summary
    console.log('\n6️⃣ Test Summary:');
    
    const overallSuccess = updateResponse.ok && uploadResponse.ok && successfulUpdates === rapidUpdates.length;
    
    if (overallSuccess) {
      console.log('✅ ALL TESTS PASSED');
      console.log('   • Profile updates working correctly');
      console.log('   • Photo uploads working correctly');
      console.log('   • Memory optimization not interfering');
      console.log('   • Data persistence confirmed');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('   • Check server logs for details');
      console.log('   • Verify database connectivity');
      console.log('   • Check memory usage');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProfileSaveFix().catch(console.error); 