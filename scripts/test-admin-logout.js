const { logoutAdmin } = require('../lib/logout-manager');

async function testAdminLogout() {
  console.log('🧪 Test Admin Logout\n');

  try {
    // Simulate admin data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_user', JSON.stringify({
        id: 'test-admin-id',
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'super_admin'
      }));
      localStorage.setItem('admin_token', 'test-admin-token');
      
      console.log('✅ Admin data set in localStorage');
    }

    console.log('🔄 Testing admin logout...');
    
    const result = await logoutAdmin({
      redirectTo: '/',
      clearAdminData: true,
      showConfirmation: false
    });

    console.log('✅ Logout result:', result);
    
    // Check if data was cleared
    if (typeof window !== 'undefined') {
      const adminUser = localStorage.getItem('admin_user');
      const adminToken = localStorage.getItem('admin_token');
      
      console.log('📋 After logout:');
      console.log('  admin_user:', adminUser ? 'EXISTS' : 'CLEARED');
      console.log('  admin_token:', adminToken ? 'EXISTS' : 'CLEARED');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run test
testAdminLogout().catch(console.error); 