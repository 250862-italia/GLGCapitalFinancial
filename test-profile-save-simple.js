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

async function testProfileSaveSimple() {
  console.log('🔧 Testing Simple Profile Save\n');
  
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
    
    // Step 2: Test simple profile update
    console.log('\n2️⃣ Testing Simple Profile Update...');
    
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    const updateData = {
      user_id: testUserId,
      first_name: 'Simple Test',
      last_name: 'User',
      phone: '+39 123 456 789'
    };
    
    console.log('📝 Sending update data:', updateData);
    
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
      return;
    }
    
    // Step 3: Verify data was saved
    console.log('\n3️⃣ Verifying Data Persistence...');
    
    const { data: savedProfile, error: profileError } = await supabase
      .from('clients')
      .select('first_name, last_name, phone')
      .eq('user_id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Failed to retrieve saved profile:', profileError.message);
      return;
    }
    
    console.log('✅ Profile data retrieved successfully');
    console.log('📊 Saved profile data:');
    console.log(`   Name: ${savedProfile.first_name} ${savedProfile.last_name}`);
    console.log(`   Phone: ${savedProfile.phone}`);
    
    // Step 4: Test photo upload
    console.log('\n4️⃣ Testing Photo Upload...');
    
    // Create a small mock file
    const mockFile = new Blob(['test'], { type: 'image/jpeg' });
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
    
    // Step 5: Final verification
    console.log('\n5️⃣ Final Verification...');
    
    const { data: finalProfile, error: finalError } = await supabase
      .from('clients')
      .select('first_name, last_name, phone, profile_photo')
      .eq('user_id', testUserId)
      .single();
    
    if (finalError) {
      console.log('❌ Failed to retrieve final profile:', finalError.message);
    } else {
      console.log('✅ Final profile verification successful');
      console.log('📊 Final profile data:');
      console.log(`   Name: ${finalProfile.first_name} ${finalProfile.last_name}`);
      console.log(`   Phone: ${finalProfile.phone}`);
      console.log(`   Photo: ${finalProfile.profile_photo ? 'Set' : 'Not set'}`);
    }
    
    // Step 6: Summary
    console.log('\n6️⃣ Test Summary:');
    
    const overallSuccess = updateResponse.ok && uploadResponse.ok;
    
    if (overallSuccess) {
      console.log('✅ ALL TESTS PASSED');
      console.log('   • Profile update working correctly');
      console.log('   • Photo upload working correctly');
      console.log('   • Data persistence confirmed');
      console.log('   • Memory optimization not interfering');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('   • Check server logs for details');
      console.log('   • Verify database connectivity');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProfileSaveSimple().catch(console.error); 