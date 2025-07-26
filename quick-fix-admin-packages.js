// Quick Fix for Admin Packages - Run this in browser console
console.log('🔧 Quick fix for admin packages...');

// Set admin authentication
const adminUser = {
  id: '51d1c5d6-3137-4d0c-b0b3-73deb56a9fa1',
  email: 'admin@glgcapital.com',
  role: 'superadmin',
  name: 'Admin GLG'
};

const adminToken = `admin_${adminUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

localStorage.setItem('admin_user', JSON.stringify(adminUser));
localStorage.setItem('admin_token', adminToken);

console.log('✅ Admin auth set up. Now refresh the page!');
console.log('Admin Token:', adminToken);

// Test the API immediately
fetch('/api/admin/packages', {
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': adminToken
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ API working:', data.packages?.length || 0, 'packages found');
})
.catch(err => {
  console.error('❌ API error:', err);
}); 