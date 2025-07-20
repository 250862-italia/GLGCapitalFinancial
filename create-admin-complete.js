const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminComplete() {
  try {
    console.log('🔧 CREATING COMPLETE ADMIN USER...\n');

    // 1. Create admin with all required fields
    console.log('📋 STEP 1: Creating admin user...');
    
    const adminData = {
      id: uuidv4(),
      email: 'admin@glgcapital.com',
      name: 'Admin User',
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
      
      // Try with different approach - check what fields are actually required
      console.log('\n📋 STEP 2: Checking table structure...');
      
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'profiles' })
        .catch(() => ({ data: null, error: 'RPC not available' }));

      if (tableError) {
        console.log('⚠️ Cannot get table info, trying minimal approach...');
        
        // Try with just the essential fields
        const minimalAdminData = {
          id: uuidv4(),
          email: 'admin@glgcapital.com',
          name: 'Admin User',
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
      }
    } else {
      console.log('✅ Admin user created successfully:', newAdmin);
    }

    // 3. Verify admin was created
    console.log('\n📋 STEP 3: Verifying admin creation...');
    
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
        console.log(`  ${index + 1}. ${admin.email} (${admin.role}) - ID: ${admin.id}`);
      });
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
      console.log('📋 Login response:', loginResult);
    } else {
      console.log('❌ Admin login API failed:', loginResult.error);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Run the function
createAdminComplete(); 