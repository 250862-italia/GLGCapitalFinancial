require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminProfile() {
  try {
    console.log('🔧 Updating admin profile...');
    
    const adminId = '95971e18-ff4f-40e6-9aae-5e273671d20b';
    
    // Update admin profile with missing fields
    const { data: updatedAdmin, error } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating admin profile:', error);
      return;
    }
    
    console.log('✅ Admin profile updated:', updatedAdmin);
    
    // Test login again
    console.log('\n🧪 Testing login with updated profile...');
    
    const loginResponse = await fetch('http://localhost:3002/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@glgcapitalgroupllc.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('📋 Admin token:', loginData.session.access_token);
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateAdminProfile(); 