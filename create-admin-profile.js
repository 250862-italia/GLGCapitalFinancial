require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminProfile() {
  try {
    console.log('🔧 Creating admin profile...');
    
    const adminId = uuidv4();
    
    const { data: newAdmin, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: adminId,
        name: 'Admin Test',
        email: 'admin@glgcapitalgroupllc.com',
        role: 'superadmin',
        first_name: 'Admin',
        last_name: 'Test',
        country: 'United States',
        kyc_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating admin profile:', createError);
      return null;
    }
    
    console.log('✅ Admin profile created:', newAdmin);
    
    // Generate admin token
    const adminToken = `admin_${adminId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n📋 Admin login credentials:');
    console.log('Email: admin@glgcapitalgroupllc.com');
    console.log('Password: admin123');
    console.log('Admin ID:', adminId);
    console.log('Admin Token:', adminToken);
    
    console.log('\n📋 For localStorage:');
    console.log(`localStorage.setItem('admin_token', '${adminToken}');`);
    console.log(`localStorage.setItem('admin_user', JSON.stringify({
      id: '${adminId}',
      email: 'admin@glgcapitalgroupllc.com',
      role: 'superadmin',
      name: 'Admin Test'
    }));`);
    
    return { admin: newAdmin, token: adminToken };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

createAdminProfile(); 