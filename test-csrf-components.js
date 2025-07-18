const BASE_URL = 'http://localhost:3000';

async function testCSRFComponents() {
  console.log('🧪 Testing CSRF Components');
  console.log('==========================');
  
  const results = {
    notes: { success: 0, errors: [], total: 0 },
    profile: { success: 0, errors: [], total: 0 },
    dashboard: { success: 0, errors: [], total: 0 },
    investments: { success: 0, errors: [], total: 0 },
    notifications: { success: 0, errors: [], total: 0 }
  };

  try {
    // 1. Test Notes API with CSRF
    console.log('\n1️⃣ Testing Notes API...');
    results.notes.total++;
    
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    const { token } = await csrfResponse.json();
    
    // Test GET notes
    const notesResponse = await fetch(`${BASE_URL}/api/notes`, {
      headers: {
        'X-CSRF-Token': token
      }
    });
    
    if (notesResponse.ok) {
      results.notes.success++;
      console.log('✅ Notes GET with CSRF successful');
    } else {
      results.notes.errors.push(`Notes GET failed: ${notesResponse.status}`);
      console.log('❌ Notes GET with CSRF failed');
    }

    // 2. Test Profile API with CSRF
    console.log('\n2️⃣ Testing Profile API...');
    results.profile.total++;
    
    const profileResponse = await fetch(`${BASE_URL}/api/profile/test-user-id`, {
      headers: {
        'X-CSRF-Token': token
      }
    });
    
    // Profile might return 404 for non-existent user, but shouldn't be CSRF error
    if (profileResponse.status !== 403) {
      results.profile.success++;
      console.log('✅ Profile API with CSRF successful (no CSRF error)');
    } else {
      results.profile.errors.push(`Profile failed with CSRF error: ${profileResponse.status}`);
      console.log('❌ Profile API failed with CSRF error');
    }

    // 3. Test Dashboard API with CSRF
    console.log('\n3️⃣ Testing Dashboard API...');
    results.dashboard.total++;
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test message'
      })
    });
    
    // Email might fail for other reasons, but shouldn't be CSRF error
    if (dashboardResponse.status !== 403) {
      results.dashboard.success++;
      console.log('✅ Dashboard email API with CSRF successful (no CSRF error)');
    } else {
      results.dashboard.errors.push(`Dashboard failed with CSRF error: ${dashboardResponse.status}`);
      console.log('❌ Dashboard API failed with CSRF error');
    }

    // 4. Test Investments API with CSRF
    console.log('\n4️⃣ Testing Investments API...');
    results.investments.total++;
    
    const investmentsResponse = await fetch(`${BASE_URL}/api/investments`, {
      headers: {
        'X-CSRF-Token': token
      }
    });
    
    if (investmentsResponse.ok) {
      results.investments.success++;
      console.log('✅ Investments GET with CSRF successful');
    } else {
      results.investments.errors.push(`Investments failed: ${investmentsResponse.status}`);
      console.log('❌ Investments GET with CSRF failed');
    }

    // 5. Test Notifications API with CSRF
    console.log('\n5️⃣ Testing Notifications API...');
    results.notifications.total++;
    
    const notificationsResponse = await fetch(`${BASE_URL}/api/notifications/test-user-id`, {
      headers: {
        'X-CSRF-Token': token
      }
    });
    
    // Notifications might return 404 for non-existent user, but shouldn't be CSRF error
    if (notificationsResponse.status !== 403) {
      results.notifications.success++;
      console.log('✅ Notifications API with CSRF successful (no CSRF error)');
    } else {
      results.notifications.errors.push(`Notifications failed with CSRF error: ${notificationsResponse.status}`);
      console.log('❌ Notifications API failed with CSRF error');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Report
  console.log('\n📊 COMPONENT TEST RESULTS');
  console.log('=========================');
  console.log(`Notes API: ${results.notes.success}/${results.notes.total}`);
  console.log(`Profile API: ${results.profile.success}/${results.profile.total}`);
  console.log(`Dashboard API: ${results.dashboard.success}/${results.dashboard.total}`);
  console.log(`Investments API: ${results.investments.success}/${results.investments.total}`);
  console.log(`Notifications API: ${results.notifications.success}/${results.notifications.total}`);
  
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
  const totalTests = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  
  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 All components working with CSRF protection!');
  } else {
    console.log('⚠️ Some components need attention');
  }
}

testCSRFComponents(); 