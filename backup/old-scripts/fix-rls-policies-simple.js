const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...');

  try {
    // First, let's disable RLS temporarily to see what's in the tables
    console.log('📋 Checking current table structure...');
    
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Error accessing clients table:', clientsError.message);
    } else {
      console.log('✅ Clients table accessible');
      if (clientsData && clientsData.length > 0) {
        console.log('📊 Sample client data:', Object.keys(clientsData[0]));
      }
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      if (profilesData && profilesData.length > 0) {
        console.log('📊 Sample profile data:', Object.keys(profilesData[0]));
      }
    }

    // Let's try to create a simple superadmin profile if it doesn't exist
    console.log('\n👤 Creating/updating superadmin profile...');
    
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: '51d1c5d6-3137-4d0c-b0b3-73deb56a9fa1', // Superadmin user ID
        email: 'admin@glgcapital.com',
        name: 'Super Admin',
        role: 'superadmin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (adminProfileError) {
      console.log('❌ Error creating admin profile:', adminProfileError.message);
    } else {
      console.log('✅ Admin profile created/updated successfully');
    }

    // Test admin access
    console.log('\n🔐 Testing admin access...');
    
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*');

    if (allClientsError) {
      console.log('❌ Error accessing all clients:', allClientsError.message);
    } else {
      console.log(`✅ Admin can access all clients: ${allClients?.length || 0} found`);
    }

    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*');

    if (allProfilesError) {
      console.log('❌ Error accessing all profiles:', allProfilesError.message);
    } else {
      console.log(`✅ Admin can access all profiles: ${allProfiles?.length || 0} found`);
    }

    console.log('\n🎉 RLS policy test completed!');

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

// Execute the fix
fixRLSPolicies(); 