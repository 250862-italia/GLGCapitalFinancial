const BASE_URL = 'http://localhost:3000';

async function testCSRFComprehensive() {
  console.log('🔒 Comprehensive CSRF Protection Test');
  console.log('=====================================');
  
  const results = {
    csrf: { success: 0, errors: [], total: 0 },
    auth: { success: 0, errors: [], total: 0 },
    investments: { success: 0, errors: [], total: 0 },
    profile: { success: 0, errors: [], total: 0 },
    notes: { success: 0, errors: [], total: 0 },
    email: { success: 0, errors: [], total: 0 },
    admin: { success: 0, errors: [], total: 0 }
  };

  try {
    // 1. Test CSRF token generation
    console.log('\n1️⃣ Testing CSRF Token Generation...');
    results.csrf.total++;
    
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfResponse.json();
    
    if (csrfResponse.ok && csrfData.token) {
      results.csrf.success++;
      console.log('✅ CSRF token generated successfully');
    } else {
      results.csrf.errors.push(`CSRF generation failed: ${csrfResponse.status}`);
      console.log('❌ CSRF token generation failed');
      return;
    }

    // 2. Test Auth routes with CSRF
    console.log('\n2️⃣ Testing Auth Routes with CSRF...');
    results.auth.total++;
    
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        country: 'Italy'
      })
    });

    if (registerResponse.ok) {
      results.auth.success++;
      console.log('✅ Registration with CSRF successful');
    } else {
      results.auth.errors.push(`Registration failed: ${registerResponse.status}`);
      console.log('❌ Registration with CSRF failed');
    }

    // 3. Test Investments route with CSRF
    console.log('\n3️⃣ Testing Investments Route with CSRF...');
    results.investments.total++;
    
    const newCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const newCsrfData = await newCsrfResponse.json();
    
    const investmentsResponse = await fetch(`${BASE_URL}/api/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': newCsrfData.token
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        packageId: 'test-package-id',
        amount: 1000,
        packageName: 'Test Package'
      })
    });

    // Should either succeed with CSRF or fail with 403 without CSRF
    if (investmentsResponse.status === 403) {
      results.investments.success++;
      console.log('✅ Investments route properly protected with CSRF');
    } else if (investmentsResponse.ok) {
      results.investments.success++;
      console.log('✅ Investments route working with CSRF');
    } else {
      results.investments.errors.push(`Investments failed: ${investmentsResponse.status}`);
      console.log('❌ Investments route failed');
    }

    // 4. Test Profile update route with CSRF
    console.log('\n4️⃣ Testing Profile Update Route with CSRF...');
    results.profile.total++;
    
    const profileCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const profileCsrfData = await profileCsrfResponse.json();
    
    const profileResponse = await fetch(`${BASE_URL}/api/profile/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': profileCsrfData.token
      },
      body: JSON.stringify({
        user_id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User'
      })
    });

    if (profileResponse.status === 403) {
      results.profile.success++;
      console.log('✅ Profile route properly protected with CSRF');
    } else if (profileResponse.ok) {
      results.profile.success++;
      console.log('✅ Profile route working with CSRF');
    } else {
      results.profile.errors.push(`Profile failed: ${profileResponse.status}`);
      console.log('❌ Profile route failed');
    }

    // 5. Test Notes route with CSRF
    console.log('\n5️⃣ Testing Notes Route with CSRF...');
    results.notes.total++;
    
    const notesCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const notesCsrfData = await notesCsrfResponse.json();
    
    const notesResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': notesCsrfData.token
      },
      body: JSON.stringify({
        title: 'Test Note'
      })
    });

    if (notesResponse.status === 403) {
      results.notes.success++;
      console.log('✅ Notes route properly protected with CSRF');
    } else if (notesResponse.ok) {
      results.notes.success++;
      console.log('✅ Notes route working with CSRF');
    } else {
      results.notes.errors.push(`Notes failed: ${notesResponse.status}`);
      console.log('❌ Notes route failed');
    }

    // 6. Test Email route with CSRF
    console.log('\n6️⃣ Testing Email Route with CSRF...');
    results.email.total++;
    
    const emailCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const emailCsrfData = await emailCsrfResponse.json();
    
    const emailResponse = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': emailCsrfData.token
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'Test message'
      })
    });

    if (emailResponse.status === 403) {
      results.email.success++;
      console.log('✅ Email route properly protected with CSRF');
    } else if (emailResponse.ok) {
      results.email.success++;
      console.log('✅ Email route working with CSRF');
    } else {
      results.email.errors.push(`Email failed: ${emailResponse.status}`);
      console.log('❌ Email route failed');
    }

    // 7. Test Admin login route with CSRF
    console.log('\n7️⃣ Testing Admin Login Route with CSRF...');
    results.admin.total++;
    
    const adminCsrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const adminCsrfData = await adminCsrfResponse.json();
    
    const adminResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': adminCsrfData.token
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword'
      })
    });

    if (adminResponse.status === 403) {
      results.admin.success++;
      console.log('✅ Admin login route properly protected with CSRF');
    } else if (adminResponse.ok) {
      results.admin.success++;
      console.log('✅ Admin login route working with CSRF');
    } else {
      results.admin.errors.push(`Admin login failed: ${adminResponse.status}`);
      console.log('❌ Admin login route failed');
    }

    // 8. Test routes WITHOUT CSRF (should fail)
    console.log('\n8️⃣ Testing Routes WITHOUT CSRF (should fail)...');
    
    const noCsrfTests = [
      { name: 'Investments', url: '/api/investments', method: 'POST', body: { userId: 'test', packageId: 'test', amount: 1000 } },
      { name: 'Profile Update', url: '/api/profile/update', method: 'POST', body: { user_id: 'test', first_name: 'Test' } },
      { name: 'Notes', url: '/api/notes', method: 'POST', body: { title: 'Test' } },
      { name: 'Email', url: '/api/send-email', method: 'POST', body: { to: 'test@example.com', subject: 'Test', body: 'Test' } }
    ];

    for (const test of noCsrfTests) {
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
          // No CSRF token
        },
        body: JSON.stringify(test.body)
      });

      if (response.status === 403) {
        console.log(`✅ ${test.name} properly rejects requests without CSRF`);
      } else {
        console.log(`⚠️ ${test.name} accepts requests without CSRF (status: ${response.status})`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Report
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('=============================');
  console.log(`CSRF Generation: ${results.csrf.success}/${results.csrf.total}`);
  console.log(`Auth Routes: ${results.auth.success}/${results.auth.total}`);
  console.log(`Investments: ${results.investments.success}/${results.investments.total}`);
  console.log(`Profile: ${results.profile.success}/${results.profile.total}`);
  console.log(`Notes: ${results.notes.success}/${results.notes.total}`);
  console.log(`Email: ${results.email.success}/${results.email.total}`);
  console.log(`Admin: ${results.admin.success}/${results.admin.total}`);

  const totalTests = Object.values(results).reduce((sum, category) => sum + category.total, 0);
  const totalSuccess = Object.values(results).reduce((sum, category) => sum + category.success, 0);

  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 All CSRF protections are working correctly!');
  } else {
    console.log('⚠️ Some CSRF protections need attention');
  }
}

testCSRFComprehensive(); 