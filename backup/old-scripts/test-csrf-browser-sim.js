const BASE_URL = 'http://localhost:3000';

async function testCSRFBrowserSim() {
  console.log('🌐 Testing CSRF Token Flow (Browser Simulation)');
  console.log('===============================================');
  
  // Simulate browser cookies
  let cookies = {};
  
  try {
    // 1. Get CSRF token (simulate browser request)
    console.log('\n1️⃣ Getting CSRF token (browser simulation)...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
      }
    });
    
    // Extract cookies from response
    const setCookieHeader = csrfResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieMatch = setCookieHeader.match(/csrf-token=([^;]+)/);
      if (cookieMatch) {
        cookies['csrf-token'] = cookieMatch[1];
        console.log('✅ CSRF token stored in cookie:', cookieMatch[1].substring(0, 10) + '...');
      }
    }
    
    const csrfData = await csrfResponse.json();
    
    console.log('CSRF Response Status:', csrfResponse.status);
    console.log('CSRF Response OK:', csrfResponse.ok);
    console.log('CSRF Token from JSON:', csrfData.token ? csrfData.token.substring(0, 10) + '...' : 'No token');
    console.log('Cookies stored:', Object.keys(cookies));
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      return;
    }
    
    // 2. Test registration with CSRF token from header
    console.log('\n2️⃣ Testing registration with CSRF token from header...');
    const testEmail1 = 'test_header_' + Date.now() + '@example.com';
    
    const registerResponse1 = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token,
        'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
      },
      body: JSON.stringify({
        email: testEmail1,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });
    
    const registerData1 = await registerResponse1.json();
    
    console.log('Register Response Status (header):', registerResponse1.status);
    console.log('Register Response OK (header):', registerResponse1.ok);
    console.log('Register Response Data (header):', registerData1.error || 'Success');
    
    if (registerResponse1.ok) {
      console.log('✅ Registration with header token successful!');
    } else {
      console.log('❌ Registration with header token failed:', registerData1.error);
    }
    
    // 3. Test registration with CSRF token from cookie only
    console.log('\n3️⃣ Testing registration with CSRF token from cookie only...');
    const testEmail2 = 'test_cookie_' + Date.now() + '@example.com';
    
    const registerResponse2 = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
      },
      body: JSON.stringify({
        email: testEmail2,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });
    
    const registerData2 = await registerResponse2.json();
    
    console.log('Register Response Status (cookie):', registerResponse2.status);
    console.log('Register Response OK (cookie):', registerResponse2.ok);
    console.log('Register Response Data (cookie):', registerData2.error || 'Success');
    
    if (registerResponse2.ok) {
      console.log('✅ Registration with cookie token successful!');
    } else {
      console.log('❌ Registration with cookie token failed:', registerData2.error);
    }
    
    // 4. Test registration without any CSRF token
    console.log('\n4️⃣ Testing registration without CSRF token (should fail)...');
    const testEmail3 = 'test_none_' + Date.now() + '@example.com';
    
    const registerResponse3 = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail3,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });
    
    const registerData3 = await registerResponse3.json();
    
    console.log('Register Response Status (no token):', registerResponse3.status);
    console.log('Register Response OK (no token):', registerResponse3.ok);
    console.log('Register Response Data (no token):', registerData3.error || 'Success');
    
    if (registerResponse3.status === 403) {
      console.log('✅ Registration properly rejected without CSRF token!');
    } else {
      console.log('❌ Registration should have been rejected without CSRF token');
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

testCSRFBrowserSim(); 