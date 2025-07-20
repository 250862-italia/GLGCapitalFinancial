// Setup admin authentication and test return button
console.log('🔧 Setting up admin authentication...');

// Set admin user data
const adminUser = {
  id: '95971e18-ff4f-40e6-9aae-5e273671d20b',
  email: 'admin@glgcapitalgroupllc.com',
  role: 'super_admin',
  first_name: 'Admin',
  last_name: 'User'
};

const adminToken = 'admin_95971e18-ff4f-40e6-9aae-5e273671d20b_1752993443467_e25opv3pv';

// Store in localStorage
localStorage.setItem('admin_user', JSON.stringify(adminUser));
localStorage.setItem('admin_token', adminToken);

console.log('✅ Admin authentication set up');
console.log('👤 Admin user:', adminUser);
console.log('🔑 Admin token:', adminToken);

// Navigate to admin investments page to test the button
console.log('🔄 Navigating to admin investments page...');
window.location.href = '/admin/investments';

// After navigation, the test-return-button.js script will run
console.log('🧪 After navigation, run test-return-button.js in console to test the button'); 