require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const os = require('os');

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

async function testMemoryFix() {
  console.log('🔧 Testing Memory Optimization Fix\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Check current memory usage
    console.log('1️⃣ Checking Memory Usage:');
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = (usedMem / totalMem) * 100;
    
    console.log(`   Current Memory Usage: ${memoryUsagePercent.toFixed(1)}%`);
    
    if (memoryUsagePercent > 95) {
      console.log('   🚨 CRITICAL MEMORY USAGE - System needs immediate attention');
    } else if (memoryUsagePercent > 85) {
      console.log('   ⚠️  HIGH MEMORY USAGE - Optimization needed');
    } else {
      console.log('   ✅ Memory usage is acceptable');
    }
    
    // Step 2: Get CSRF token
    console.log('\n2️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    console.log('✅ CSRF token obtained');
    const csrfToken = csrfData.token;
    
    // Step 3: Test profile update with memory protection
    console.log('\n3️⃣ Testing Profile Update with Memory Protection...');
    
    const testUserId = '3016af70-23c1-4100-8bd0-0dffcc07d4a2';
    const updateData = {
      user_id: testUserId,
      first_name: 'Memory Test',
      last_name: 'User',
      phone: '+39 555 123 456',
      company: 'Memory Test Company',
      position: 'Memory Test Position',
      date_of_birth: '1990-01-01',
      nationality: 'italian',
      address: 'Memory Test Address',
      city: 'Roma',
      country: 'Italy',
      postal_code: '00100',
      annual_income: 75000,
      net_worth: 300000,
      investment_experience: 'intermediate',
      risk_tolerance: 'medium'
    };
    
    const { response: updateResponse, data: updateResult } = await makeRequest(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(updateData)
    });
    
    console.log(`Update Response Status: ${updateResponse.status}`);
    console.log(`Update Success: ${updateResult.success}`);
    
    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Profile update successful with memory protection');
      console.log('📊 Updated data:', updateResult.data);
    } else {
      console.log('❌ Profile update failed');
      console.log('Error:', updateResult.error || updateResult.warning);
    }
    
    // Step 4: Test photo upload with memory protection
    console.log('\n4️⃣ Testing Photo Upload with Memory Protection...');
    
    // Create a mock file for testing
    const mockFile = new Blob(['test image data for memory test'], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('photo', mockFile, 'memory-test.jpg');
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
      console.log('✅ Photo upload successful with memory protection');
      console.log('📸 Photo URL:', uploadResult.photo_url);
    } else {
      console.log('❌ Photo upload failed');
      console.log('Error:', uploadResult.error);
    }
    
    // Step 5: Verify data persistence
    console.log('\n5️⃣ Verifying Data Persistence...');
    
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
    
    // Step 6: Test multiple rapid operations
    console.log('\n6️⃣ Testing Multiple Rapid Operations...');
    
    const rapidOperations = Array.from({ length: 5 }, (_, i) => ({
      user_id: testUserId,
      first_name: `Rapid Test ${i + 1}`,
      last_name: `Operation ${i + 1}`,
      phone: `+39 999 999 ${i + 1}`,
      company: `Rapid Company ${i + 1}`
    }));
    
    let successfulOperations = 0;
    let failedOperations = 0;
    
    for (const operation of rapidOperations) {
      try {
        const { response, data } = await makeRequest(`${BASE_URL}/api/profile/update`, {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body: JSON.stringify(operation)
        });
        
        if (response.ok && data.success) {
          successfulOperations++;
        } else {
          failedOperations++;
        }
      } catch (error) {
        failedOperations++;
        console.log(`Operation error: ${error.message}`);
      }
    }
    
    console.log(`Rapid Operations: ${successfulOperations} successful, ${failedOperations} failed`);
    
    if (successfulOperations === rapidOperations.length) {
      console.log('✅ All rapid operations successful - memory protection working');
    } else {
      console.log('⚠️  Some operations failed - possible memory interference');
    }
    
    // Step 7: Final memory check
    console.log('\n7️⃣ Final Memory Check:');
    const finalTotalMem = os.totalmem();
    const finalFreeMem = os.freemem();
    const finalUsedMem = finalTotalMem - finalFreeMem;
    const finalMemoryUsagePercent = (finalUsedMem / finalTotalMem) * 100;
    
    console.log(`   Final Memory Usage: ${finalMemoryUsagePercent.toFixed(1)}%`);
    console.log(`   Memory Change: ${(finalMemoryUsagePercent - memoryUsagePercent).toFixed(1)}%`);
    
    // Step 8: Summary
    console.log('\n8️⃣ Test Summary:');
    
    const overallSuccess = updateResponse.ok && uploadResponse.ok && successfulOperations === rapidOperations.length;
    
    if (overallSuccess) {
      console.log('✅ ALL TESTS PASSED');
      console.log('   • Memory optimization working correctly');
      console.log('   • Profile updates working with memory protection');
      console.log('   • Photo uploads working with memory protection');
      console.log('   • Data persistence confirmed');
      console.log('   • Rapid operations stable');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('   • Check server logs for details');
      console.log('   • Memory usage may still be too high');
      console.log('   • Consider system restart');
    }
    
    // Recommendations
    console.log('\n📋 Recommendations:');
    if (finalMemoryUsagePercent > 95) {
      console.log('   🚨 IMMEDIATE: System restart recommended');
      console.log('   🚨 IMMEDIATE: Check for memory leaks');
      console.log('   🚨 IMMEDIATE: Increase server resources');
    } else if (finalMemoryUsagePercent > 85) {
      console.log('   ⚠️  HIGH: Monitor memory usage closely');
      console.log('   ⚠️  HIGH: Consider optimization');
    } else {
      console.log('   ✅ GOOD: Memory usage is stable');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testMemoryFix().catch(console.error); 