require('dotenv').config({ path: '.env.local' });

async function testAdminAuth() {
  try {
    console.log('🧪 Testing admin authentication...');
    
    const adminToken = 'admin_95971e18-ff4f-40e6-9aae-5e273671d20b_1752992218541_r7it833kl';
    
    console.log('📋 Using token:', adminToken);
    
    const response = await fetch('http://localhost:3001/api/admin/investments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-session': adminToken
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Authentication successful!');
    } else {
      console.log('❌ Authentication failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

testAdminAuth(); 