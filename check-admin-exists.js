const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminExists() {
  try {
    console.log('🔍 CHECKING ADMIN EXISTS...\n');

    // 1. Check if profiles table exists and has data
    console.log('📋 STEP 1: Checking profiles table...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
      return;
    }

    console.log(`✅ Profiles table accessible - Found ${profiles.length} profiles`);

    if (profiles.length > 0) {
      console.log('📋 Sample profiles:');
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} (${profile.role || 'no role'})`);
      });
    }

    // 2. Check for admin users specifically
    console.log('\n📋 STEP 2: Checking for admin users...');
    
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('*')
      .or('role.eq.admin,role.eq.superadmin,role.eq.super_admin');

    if (adminsError) {
      console.log('❌ Error searching for admins:', adminsError.message);
      return;
    }

    console.log(`✅ Found ${admins.length} admin users:`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.email} (${admin.role})`);
      });
    } else {
      console.log('❌ No admin users found!');
      
      // 3. Create admin user if none exists
      console.log('\n📋 STEP 3: Creating admin user...');
      
      const adminData = {
        id: 'admin-' + Date.now(),
        email: 'admin@glgcapital.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'superadmin',
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newAdmin, error: createError } = await supabase
        .from('profiles')
        .insert([adminData])
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating admin:', createError.message);
        return;
      }

      console.log('✅ Admin user created successfully:', newAdmin.email);
    }

    // 4. Test admin login API
    console.log('\n📋 STEP 4: Testing admin login API...');
    
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-token' // CSRF token for development
      },
      body: JSON.stringify({
        email: 'admin@glgcapital.com',
        password: 'GLGAdmin2024!'
      })
    });

    const loginResult = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login API working:', loginResult.message || 'Success');
    } else {
      console.log('❌ Admin login API failed:', loginResult.error);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Run the check
checkAdminExists(); 