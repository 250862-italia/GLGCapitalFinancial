const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminSimple() {
  try {
    console.log('🔧 CREATING ADMIN USER...\n');

    // 1. Check profiles table structure
    console.log('📋 STEP 1: Checking profiles table structure...');
    
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing profiles table:', sampleError.message);
      return;
    }

    if (sampleProfile.length > 0) {
      console.log('✅ Profiles table accessible');
      console.log('📋 Available columns:', Object.keys(sampleProfile[0]));
    } else {
      console.log('✅ Profiles table accessible (empty)');
    }

    // 2. Create admin with minimal fields
    console.log('\n📋 STEP 2: Creating admin user...');
    
    const adminData = {
      id: 'admin-' + Date.now(),
      email: 'admin@glgcapital.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'superadmin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📋 Admin data to insert:', adminData);

    const { data: newAdmin, error: createError } = await supabase
      .from('profiles')
      .insert([adminData])
      .select()
      .single();

    if (createError) {
      console.log('❌ Error creating admin:', createError.message);
      
      // Try with even simpler data
      console.log('\n📋 STEP 3: Trying with minimal data...');
      
      const minimalAdminData = {
        id: 'admin-' + Date.now(),
        email: 'admin@glgcapital.com',
        role: 'superadmin'
      };

      const { data: minimalAdmin, error: minimalError } = await supabase
        .from('profiles')
        .insert([minimalAdminData])
        .select()
        .single();

      if (minimalError) {
        console.log('❌ Error creating minimal admin:', minimalError.message);
        return;
      }

      console.log('✅ Minimal admin created:', minimalAdmin);
    } else {
      console.log('✅ Admin user created successfully:', newAdmin);
    }

    // 3. Verify admin was created
    console.log('\n📋 STEP 4: Verifying admin creation...');
    
    const { data: admins, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@glgcapital.com');

    if (verifyError) {
      console.log('❌ Error verifying admin:', verifyError.message);
      return;
    }

    console.log(`✅ Found ${admins.length} admin users with email admin@glgcapital.com`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.email} (${admin.role})`);
      });
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Run the function
createAdminSimple(); 