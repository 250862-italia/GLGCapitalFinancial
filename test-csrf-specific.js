const BASE_URL = 'http://localhost:3000';

async function testSpecificCSRFIssues() {
  console.log('🔍 Testing Specific CSRF Issues');
  console.log('================================');
  
  const testCases = [
    {
      name: 'Admin Login',
      url: '/api/admin/login',
      method: 'POST',
      body: { email: 'admin@example.com', password: 'test123' }
    },
    {
      name: 'User Login',
      url: '/api/auth/login',
      method: 'POST',
      body: { email: 'user@example.com', password: 'test123' }
    },
    {
      name: 'User Registration',
      url: '/api/auth/register',
      method: 'POST',
      body: { 
        email: `test_${Date.now()}@example.com`, 
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      }
    },
    {
      name: 'Forgot Password',
      url: '/api/auth/forgot-password',
      method: 'POST',
      body: { email: 'test@example.com' }
    },
    {
      name: 'Contact Form',
      url: '/api/informational-request',
      method: 'POST',
      body: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '123456789',
        country: 'Italy',
        city: 'Rome'
      }
    },
    {
      name: 'Send Email',
      url: '/api/send-email',
      method: 'POST',
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email'
      }
    },
    {
      name: 'Create Note',
      url: '/api/notes',
      method: 'POST',
      body: { title: 'Test Note' }
    },
    {
      name: 'Profile Update',
      url: '/api/profile/update',
      method: 'POST',
      body: {
        user_id: 'test-user-id',
        first_name: 'Updated',
        last_name: 'Name'
      }
    },
    {
      name: 'Create Investment',
      url: '/api/investments',
      method: 'POST',
      body: {
        userId: 'test-user-id',
        packageId: 'test-package-id',
        amount: 1000,
        packageName: 'Test Package'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      // Test 1: With valid CSRF token
      console.log('1️⃣ Testing with valid CSRF token...');
      const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
      const csrfData = await csrfResponse.json();
      
      if (!csrfResponse.ok || !csrfData.token) {
        console.log('❌ Failed to get CSRF token');
        continue;
      }
      
      const validResponse = await fetch(`${BASE_URL}${testCase.url}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.token
        },
        body: JSON.stringify(testCase.body)
      });
      
      console.log(`   Status: ${validResponse.status}`);
      const validData = await validResponse.json();
      if (validResponse.status === 403) {
        console.log('   ❌ CSRF validation failed with valid token');
        console.log('   Error:', validData);
      } else {
        console.log('   ✅ CSRF validation passed with valid token');
      }
      
      // Test 2: Without CSRF token
      console.log('2️⃣ Testing without CSRF token...');
      const noTokenResponse = await fetch(`${BASE_URL}${testCase.url}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.body)
      });
      
      console.log(`   Status: ${noTokenResponse.status}`);
      const noTokenData = await noTokenResponse.json();
      if (noTokenResponse.status === 403) {
        console.log('   ✅ CSRF protection working (no token rejected)');
      } else {
        console.log('   ⚠️ CSRF protection may not be working (no token accepted)');
        console.log('   Response:', noTokenData);
      }
      
      // Test 3: With invalid CSRF token
      console.log('3️⃣ Testing with invalid CSRF token...');
      const invalidResponse = await fetch(`${BASE_URL}${testCase.url}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token-12345'
        },
        body: JSON.stringify(testCase.body)
      });
      
      console.log(`   Status: ${invalidResponse.status}`);
      const invalidData = await invalidResponse.json();
      if (invalidResponse.status === 403) {
        console.log('   ✅ CSRF protection working (invalid token rejected)');
      } else {
        console.log('   ❌ CSRF protection not working (invalid token accepted)');
        console.log('   Response:', invalidData);
      }
      
    } catch (error) {
      console.log(`   ❌ Test error: ${error.message}`);
    }
  }
}

testSpecificCSRFIssues(); 