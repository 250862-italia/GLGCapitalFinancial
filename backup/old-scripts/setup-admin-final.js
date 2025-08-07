// Script finale per configurare l'admin nel frontend
// Esegui questo script nella console del browser quando sei nella pagina admin

console.log('🔧 Setting up admin frontend (FINAL)...');

// Dati admin funzionanti
const adminData = {
  id: '95971e18-ff4f-40e6-9aae-5e273671d20b',
  email: 'admin@glgcapitalgroupllc.com',
  role: 'superadmin',
  name: 'Admin Test'
};

// Token generato dal login funzionante
const adminToken = 'admin_95971e18-ff4f-40e6-9aae-5e273671d20b_1752992899211_vpb4z7g8f';

// Imposta localStorage
localStorage.setItem('admin_token', adminToken);
localStorage.setItem('admin_user', JSON.stringify(adminData));

console.log('✅ Admin data set in localStorage:');
console.log('Token:', adminToken);
console.log('User:', adminData);

// Verifica che sia stato impostato correttamente
const storedToken = localStorage.getItem('admin_token');
const storedUser = localStorage.getItem('admin_user');

console.log('🔍 Verification:');
console.log('Stored token:', storedToken);
console.log('Stored user:', storedUser);

if (storedToken && storedUser) {
  console.log('✅ Admin setup successful! You can now access admin pages.');
  console.log('📋 Go to: http://localhost:3000/admin/investments');
  console.log('🔑 Login credentials:');
  console.log('   Email: admin@glgcapitalgroupllc.com');
  console.log('   Password: admin123');
} else {
  console.log('❌ Admin setup failed!');
}

// Test API call
console.log('\n🧪 Testing API call...');
fetch('/api/admin/investments', {
  headers: {
    'x-admin-session': adminToken
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ API test successful:', data);
})
.catch(error => {
  console.log('❌ API test failed:', error);
}); 