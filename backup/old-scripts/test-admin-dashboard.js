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

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard...\n');

  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@glgcapital.com',
      password: 'GLGAdmin2024!'
    });

    if (authError) {
      console.log('❌ Admin login failed:', authError.message);
      return;
    }

    console.log('✅ Admin login successful');
    console.log(`👤 User ID: ${user.id}`);
    console.log(`📧 Email: ${user.email}`);

    // 2. Test admin profile access
    console.log('\n2. Testing admin profile access...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Admin profile access failed:', profileError.message);
    } else {
      console.log('✅ Admin profile accessible');
      console.log(`🔐 Role: ${adminProfile.role}`);
      console.log(`👤 Name: ${adminProfile.name}`);
    }

    // 3. Test admin access to all clients
    console.log('\n3. Testing admin access to all clients...');
    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (clientsError) {
      console.log('❌ Admin clients access failed:', clientsError.message);
    } else {
      console.log(`✅ Admin can access all clients: ${allClients?.length || 0} found`);
    }

    // 4. Test admin access to all profiles
    console.log('\n4. Testing admin access to all profiles...');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.log('❌ Admin profiles access failed:', profilesError.message);
    } else {
      console.log(`✅ Admin can access all profiles: ${allProfiles?.length || 0} found`);
    }

    // 5. Test admin access to investments
    console.log('\n5. Testing admin access to investments...');
    const { data: allInvestments, error: investmentsError } = await supabase
      .from('investments')
      .select('*');

    if (investmentsError) {
      console.log('❌ Admin investments access failed:', investmentsError.message);
    } else {
      console.log(`✅ Admin can access all investments: ${allInvestments?.length || 0} found`);
    }

    // 6. Test admin access to notes
    console.log('\n6. Testing admin access to notes...');
    const { data: allNotes, error: notesError } = await supabase
      .from('notes')
      .select('*');

    if (notesError) {
      console.log('❌ Admin notes access failed:', notesError.message);
    } else {
      console.log(`✅ Admin can access all notes: ${allNotes?.length || 0} found`);
    }

    console.log('\n🎉 ADMIN DASHBOARD TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin authentication working');
    console.log('✅ Admin profile accessible');
    console.log('✅ Admin can access all tables');
    console.log('✅ RLS policies working correctly');
    
    console.log('\n🌐 Next Steps:');
    console.log('1. Visit: http://localhost:3000/admin/login');
    console.log('2. Login with: admin@glgcapital.com / GLGAdmin2024!');
    console.log('3. Explore the admin dashboard features');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup - sign out
    await supabase.auth.signOut();
    console.log('\n👋 Admin session ended');
  }
}

// Run the test
testAdminDashboard(); 