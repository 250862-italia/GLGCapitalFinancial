const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // First, create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@glgcapital.com',
      password: 'GLGAdmin2024!',
      email_confirm: true,
      user_metadata: {
        role: 'superadmin',
        first_name: 'Admin',
        last_name: 'GLG'
      }
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }
    
    console.log('✅ Auth user created:', authUser.user.id);
    
    // Create profile in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        name: 'GLG Capital Admin',
        email: 'admin@glgcapital.com',
        role: 'superadmin',
        first_name: 'Admin',
        last_name: 'GLG',
        country: 'United States',
        kyc_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }
    
    console.log('✅ Profile created:', profile);
    
    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authUser.user.id,
        profile_id: authUser.user.id,
        first_name: 'Admin',
        last_name: 'GLG',
        email: 'admin@glgcapital.com',
        company: 'GLG Capital Group LLC',
        position: 'System Administrator',
        nationality: 'United States',
        status: 'active',
        risk_profile: 'moderate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.error('❌ Error creating client:', clientError);
    } else {
      console.log('✅ Client record created:', client);
    }
    
    // Generate admin token
    const adminToken = `admin_${authUser.user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n📋 Admin login credentials:');
    console.log('Email: admin@glgcapital.com');
    console.log('Password: GLGAdmin2024!');
    console.log('Admin ID:', authUser.user.id);
    console.log('Admin Token:', adminToken);
    
    console.log('\n📋 For localStorage:');
    console.log(`localStorage.setItem('admin_token', '${adminToken}');`);
    console.log(`localStorage.setItem('admin_user', JSON.stringify({
      id: '${authUser.user.id}',
      email: 'admin@glgcapital.com',
      role: 'superadmin',
      name: 'GLG Capital Admin'
    }));`);
    
    // Test admin login
    console.log('\n🧪 Testing admin login...');
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@glgcapital.com',
        password: 'GLGAdmin2024!'
      })
    });
    
    const loginResult = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login test successful:', loginResult.message || 'Success');
    } else {
      console.log('❌ Admin login test failed:', loginResult.error);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminUser(); 