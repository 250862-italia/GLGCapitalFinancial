require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...');
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@glgcapitalgroupllc.com')
      .single();
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin);
      return existingAdmin;
    }
    
    // Create admin user
    const adminData = {
      email: 'admin@glgcapitalgroupllc.com',
      first_name: 'Admin',
      last_name: 'Test',
      role: 'superadmin',
      is_active: true,
      email_verified: true,
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password'
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newAdmin, error: createError } = await supabase
      .from('users')
      .insert(adminData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating admin:', createError);
      return null;
    }
    
    console.log('✅ Test admin created:', newAdmin);
    return newAdmin;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

async function testAdminLogin() {
  try {
    console.log('\n🔐 Testing admin login...');
    
    // Simulate admin login
    const adminToken = `admin_${Date.now()}_test_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📋 Admin token generated:', adminToken);
    console.log('📋 You can use this token in localStorage:');
    console.log(`localStorage.setItem('admin_token', '${adminToken}');`);
    console.log(`localStorage.setItem('admin_user', JSON.stringify({
      id: 'admin-test-id',
      email: 'admin@glgcapitalgroupllc.com',
      role: 'superadmin'
    }));`);
    
    return adminToken;
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    return null;
  }
}

async function testAPIWithToken(token) {
  try {
    console.log('\n🧪 Testing API with token...');
    
    const response = await fetch('http://localhost:3001/api/admin/investments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-session': token
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ API call failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the tests
async function main() {
  const admin = await createTestAdmin();
  if (admin) {
    const token = await testAdminLogin();
    if (token) {
      await testAPIWithToken(token);
    }
  }
}

main(); 