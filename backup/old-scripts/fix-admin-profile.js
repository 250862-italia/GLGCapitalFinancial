const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminProfile() {
  try {
    console.log('🔧 Fixing admin profile...');
    
    // First, find the existing admin user in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }
    
    const adminUser = users.find(user => user.email === 'admin@glgcapital.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found in Supabase Auth');
      return;
    }
    
    console.log('✅ Found admin user in Auth:', adminUser.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileCheckError);
      return;
    }
    
    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile);
      
      // Update role if needed
      if (existingProfile.role !== 'superadmin') {
        console.log('🔄 Updating role to superadmin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'superadmin' })
          .eq('id', adminUser.id);
        
        if (updateError) {
          console.error('❌ Error updating role:', updateError);
        } else {
          console.log('✅ Role updated to superadmin');
        }
      }
    } else {
      console.log('📝 Creating missing profile...');
      
      // Create profile in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
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
    }
    
    // Check if client record exists
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    if (clientCheckError && clientCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking client:', clientCheckError);
    } else if (!existingClient) {
      console.log('📝 Creating missing client record...');
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: adminUser.id,
          profile_id: adminUser.id,
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
    } else {
      console.log('✅ Client record already exists:', existingClient);
    }
    
    // Generate admin token
    const adminToken = `admin_${adminUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('\n📋 Admin login credentials:');
    console.log('Email: admin@glgcapital.com');
    console.log('Password: GLGAdmin2024!');
    console.log('Admin ID:', adminUser.id);
    console.log('Admin Token:', adminToken);
    
    console.log('\n📋 For localStorage:');
    console.log(`localStorage.setItem('admin_token', '${adminToken}');`);
    console.log(`localStorage.setItem('admin_user', JSON.stringify({
      id: '${adminUser.id}',
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

fixAdminProfile(); 