require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user in Supabase Auth...');
    
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@glgcapitalgroupllc.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'superadmin',
        first_name: 'Admin',
        last_name: 'Test'
      }
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return null;
    }
    
    console.log('✅ Auth user created:', authUser.user.id);
    
    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
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
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return null;
    }
    
    console.log('✅ Profile created:', profile);
    
    // Generate admin token
    const adminToken = `admin_${authUser.user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n📋 Admin login credentials:');
    console.log('Email: admin@glgcapitalgroupllc.com');
    console.log('Password: admin123');
    console.log('Admin ID:', authUser.user.id);
    console.log('Admin Token:', adminToken);
    
    console.log('\n📋 For localStorage:');
    console.log(`localStorage.setItem('admin_token', '${adminToken}');`);
    console.log(`localStorage.setItem('admin_user', JSON.stringify({
      id: '${authUser.user.id}',
      email: 'admin@glgcapitalgroupllc.com',
      role: 'superadmin',
      name: 'Admin Test'
    }));`);
    
    return { admin: profile, token: adminToken, authUser: authUser.user };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

createAdminUser(); 