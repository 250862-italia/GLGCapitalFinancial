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

async function testKYCPage() {
  console.log('🧪 Testing KYC Page CSS and Functionality...\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error('❌ Failed to get CSRF token:', csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    
    // Step 2: Admin login
    console.log('\n2️⃣ Testing admin login...');
    const loginData = {
      email: 'admin@glgcapital.com',
      password: 'Admin123!'
    };
    
    const { response: loginResponse, data: loginResult } = await makeRequest(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📊 Login Response:', {
      status: loginResponse.status,
      success: loginResult.success,
      message: loginResult.message
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Admin login failed');
      return;
    }
    
    console.log('✅ Admin login successful');
    
    // Step 3: Test KYC API
    console.log('\n3️⃣ Testing KYC API...');
    const { response: kycResponse, data: kycResult } = await makeRequest(`${BASE_URL}/api/admin/kyc`, {
      headers: {
        'X-CSRF-Token': csrfData.token,
        'x-admin-token': loginResult.token
      }
    });
    
    console.log('📊 KYC API Response:', {
      status: kycResponse.status,
      success: kycResult.success,
      clientsCount: kycResult.clients?.length || 0
    });
    
    if (!kycResponse.ok) {
      console.error('❌ KYC API failed:', kycResult);
      return;
    }
    
    console.log('✅ KYC API successful');
    
    // Step 4: Test page accessibility
    console.log('\n4️⃣ Testing page accessibility...');
    const pageResponse = await fetch(`${BASE_URL}/admin/kyc`, {
      headers: {
        'Cookie': `admin_token=${loginResult.token}`
      }
    });
    
    console.log('📊 Page Response:', {
      status: pageResponse.status,
      contentType: pageResponse.headers.get('content-type')
    });
    
    if (pageResponse.ok) {
      const pageContent = await pageResponse.text();
      const hasTailwindClasses = pageContent.includes('container') || pageContent.includes('mx-auto') || pageContent.includes('p-6');
      const hasCardComponents = pageContent.includes('Card') || pageContent.includes('card');
      
      console.log('✅ Page loads successfully');
      console.log('📊 CSS Analysis:', {
        hasTailwindClasses,
        hasCardComponents,
        contentLength: pageContent.length
      });
    } else {
      console.error('❌ Page failed to load');
    }
    
    console.log('\n🎯 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testKYCPage(); 