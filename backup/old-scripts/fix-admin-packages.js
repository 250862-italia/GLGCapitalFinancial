// Fix Admin Packages - Set up proper admin authentication
console.log('🔧 Setting up admin authentication for packages page...');

// Set admin user data
const adminUser = {
  id: '95971e18-ff4f-40e6-9aae-5e273671d20b',
  email: 'admin@glgcapitalgroupllc.com',
  role: 'superadmin',
  name: 'Admin Test'
};

// Generate a fresh admin token
const adminToken = `admin_${adminUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Store in localStorage
localStorage.setItem('admin_user', JSON.stringify(adminUser));
localStorage.setItem('admin_token', adminToken);

console.log('✅ Admin authentication set up:');
console.log('Admin Token:', adminToken);
console.log('Admin User:', adminUser);

// Test the packages API directly
console.log('\n🧪 Testing packages API...');

fetch('/api/admin/packages', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'test-csrf-token',
    'x-admin-token': adminToken
  }
})
.then(response => {
  console.log('📡 API Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Packages API Response:', data);
  console.log('📊 Number of packages:', data.packages?.length || 0);
})
.catch(error => {
  console.error('❌ API Error:', error);
});

console.log('\n🔄 Now try refreshing the packages page...'); 