const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Admin Connection and Setup');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testAdminConnection() {
  try {
    console.log('1️⃣ Testing Supabase connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
      return false;
    }
    
    console.log('✅ Connection test passed');
    
    // Check for admin users
    console.log('\n2️⃣ Checking for admin users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .or('role.eq.admin,role.eq.superadmin,role.eq.super_admin');
    
    if (adminError) {
      console.log('❌ Error fetching admin users:', adminError.message);
      return false;
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log('✅ Found admin users:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      return true;
    } else {
      console.log('❌ No admin users found');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error during connection test:', error.message);
    return false;
  }
}

async function createAdminUser() {
  console.log('\n3️⃣ Creating admin user...');
  
  const adminData = {
    email: 'admin@glgcapital.com',
    password: 'GLGAdmin2024!',
    first_name: 'Admin',
    last_name: 'GLG',
    role: 'superadmin',
    is_active: true,
    email_verified: true
  };
  
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true
    });
    
    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return false;
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        role: adminData.role,
        is_active: adminData.is_active,
        email_verified: adminData.email_verified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile created:', profileData.id);
    
    // Create client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authData.user.id,
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.log('⚠️ Error creating client record:', clientError.message);
      // Don't fail if client creation fails
    } else {
      console.log('✅ Client record created:', clientData.id);
    }
    
    console.log('\n✅ Admin user created successfully!');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('   Role:', adminData.role);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error creating admin:', error.message);
    return false;
  }
}

async function main() {
  const hasAdmin = await testAdminConnection();
  
  if (!hasAdmin) {
    console.log('\n🔄 No admin found, creating one...');
    const created = await createAdminUser();
    
    if (created) {
      console.log('\n✅ Admin setup completed!');
      console.log('   You can now login with:');
      console.log('   Email: admin@glgcapital.com');
      console.log('   Password: GLGAdmin2024!');
    } else {
      console.log('\n❌ Failed to create admin user');
    }
  } else {
    console.log('\n✅ Admin users already exist');
  }
}

main().catch(console.error); 