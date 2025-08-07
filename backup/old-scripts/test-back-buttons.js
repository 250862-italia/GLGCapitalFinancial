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

async function testBackButtons() {
  console.log('🔘 Testing Back to Dashboard Buttons\n');
  
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
    
    // Step 2: Test profile page back button
    console.log('\n2️⃣ Testing Profile Page Back Button...');
    
    const profileResponse = await fetch(`${BASE_URL}/profile`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    
    console.log(`Profile page status: ${profileResponse.status}`);
    
    if (profileResponse.ok) {
      console.log('✅ Profile page accessible');
      
      // Check if the page contains the back button
      const profileHtml = await profileResponse.text();
      if (profileHtml.includes('Back to Dashboard')) {
        console.log('✅ Back to Dashboard button found on profile page');
      } else {
        console.log('❌ Back to Dashboard button not found on profile page');
      }
    } else {
      console.log('❌ Profile page not accessible');
    }
    
    // Step 3: Test investments page back button
    console.log('\n3️⃣ Testing Investments Page Back Button...');
    
    const investmentsResponse = await fetch(`${BASE_URL}/dashboard/investments`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    
    console.log(`Investments page status: ${investmentsResponse.status}`);
    
    if (investmentsResponse.ok) {
      console.log('✅ Investments page accessible');
      
      // Check if the page contains the back button
      const investmentsHtml = await investmentsResponse.text();
      if (investmentsHtml.includes('ArrowLeft') || investmentsHtml.includes('back')) {
        console.log('✅ Back button found on investments page');
      } else {
        console.log('❌ Back button not found on investments page');
      }
    } else {
      console.log('❌ Investments page not accessible');
    }
    
    // Step 4: Test informational request page back button
    console.log('\n4️⃣ Testing Informational Request Page Back Button...');
    
    const infoResponse = await fetch(`${BASE_URL}/informational-request`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    
    console.log(`Informational request page status: ${infoResponse.status}`);
    
    if (infoResponse.ok) {
      console.log('✅ Informational request page accessible');
      
      // Check if the page contains the back button
      const infoHtml = await infoResponse.text();
      if (infoHtml.includes('Return to Dashboard') || infoHtml.includes('Cancel')) {
        console.log('✅ Back/Return button found on informational request page');
      } else {
        console.log('❌ Back/Return button not found on informational request page');
      }
    } else {
      console.log('❌ Informational request page not accessible');
    }
    
    // Step 5: Test navigation functionality
    console.log('\n5️⃣ Testing Navigation Functionality...');
    
    // Test direct navigation to dashboard
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    
    console.log(`Dashboard page status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard page accessible');
    } else {
      console.log('❌ Dashboard page not accessible');
    }
    
    // Step 6: Summary
    console.log('\n6️⃣ Test Summary:');
    
    const allPagesAccessible = profileResponse.ok && investmentsResponse.ok && infoResponse.ok && dashboardResponse.ok;
    
    if (allPagesAccessible) {
      console.log('✅ ALL PAGES ACCESSIBLE');
      console.log('   • Profile page working');
      console.log('   • Investments page working');
      console.log('   • Informational request page working');
      console.log('   • Dashboard page working');
      console.log('   • Back buttons should work with safe router');
    } else {
      console.log('❌ SOME PAGES NOT ACCESSIBLE');
      console.log('   • Check authentication status');
      console.log('   • Verify CSRF token validity');
      console.log('   • Check server logs for errors');
    }
    
    console.log('\n📝 Manual Testing Required:');
    console.log('   • Navigate to /profile and click "Back to Dashboard"');
    console.log('   • Navigate to /dashboard/investments and click the back arrow');
    console.log('   • Navigate to /informational-request and click "Return to Dashboard"');
    console.log('   • Check browser console for navigation logs');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testBackButtons().catch(console.error); 