// Complete Fix for Admin Packages - Comprehensive Solution
console.log('🔧 Complete fix for admin packages page...');

// Step 1: Set up proper admin authentication
const adminUser = {
  id: '51d1c5d6-3137-4d0c-b0b3-73deb56a9fa1',
  email: 'admin@glgcapital.com',
  role: 'superadmin',
  name: 'Admin GLG'
};

// Generate a fresh admin token
const adminToken = `admin_${adminUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Store in localStorage
localStorage.setItem('admin_user', JSON.stringify(adminUser));
localStorage.setItem('admin_token', adminToken);

console.log('✅ Admin authentication set up:');
console.log('Admin Token:', adminToken);
console.log('Admin User:', adminUser);

// Step 2: Test CSRF token generation
console.log('\n🧪 Testing CSRF token generation...');

fetch('/api/csrf', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📡 CSRF Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ CSRF token generated:', data.token ? 'Success' : 'Failed');
  
  // Step 3: Test packages API with regular fetch
  console.log('\n🧪 Testing packages API with regular fetch...');
  
  return fetch('/api/admin/packages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    }
  });
})
.then(response => {
  console.log('📡 Packages API Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Packages API Response:', data);
  console.log('📊 Number of packages:', data.packages?.length || 0);
  
  // Step 4: Test packages API with CSRF fetch
  console.log('\n🧪 Testing packages API with CSRF fetch...');
  
  // Import the CSRF client functions
  import('/lib/csrf-client.js').then(csrfModule => {
    return csrfModule.fetchWithCSRF('/api/admin/packages', {
      headers: {
        'x-admin-token': adminToken
      }
    });
  })
  .then(response => {
    console.log('📡 CSRF Packages API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ CSRF Packages API Response:', data);
    console.log('📊 Number of packages:', data.packages?.length || 0);
  })
  .catch(error => {
    console.error('❌ CSRF API Error:', error);
  });
})
.catch(error => {
  console.error('❌ API Error:', error);
});

console.log('\n🔄 Now try accessing the packages page at:');
console.log('http://localhost:3000/admin/packages');
console.log('\n📋 If you still see errors, check the browser console for detailed logs.'); 