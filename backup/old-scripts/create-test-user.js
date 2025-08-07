const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Creating Test User with Correct Credentials');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTestUser() {
  const testUserData = {
    email: 'test@glgcapital.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    role: 'user'
  };
  
  try {
    console.log('1️⃣ Creating user in Supabase Auth...');
    
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUserData.email,
      password: testUserData.password,
      email_confirm: true
    });
    
    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return false;
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // Create profile with correct structure
    console.log('2️⃣ Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: testUserData.email,
        first_name: testUserData.first_name,
        last_name: testUserData.last_name,
        name: `${testUserData.first_name} ${testUserData.last_name}`,
        role: testUserData.role,
        country: 'Italy',
        kyc_status: 'pending',
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
    console.log('3️⃣ Creating client record...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authData.user.id,
        email: testUserData.email,
        first_name: testUserData.first_name,
        last_name: testUserData.last_name,
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
    
    console.log('\n✅ Test user created successfully!');
    console.log('   Email:', testUserData.email);
    console.log('   Password:', testUserData.password);
    console.log('   Role:', testUserData.role);
    console.log('   User ID:', authData.user.id);
    
    // Test the login
    console.log('\n4️⃣ Testing login with new user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUserData.email,
      password: testUserData.password
    });
    
    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('   User ID:', loginData.user.id);
      console.log('   Email:', loginData.user.email);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
    return false;
  }
}

async function main() {
  const success = await createTestUser();
  
  if (success) {
    console.log('\n🎉 Test user setup completed!');
    console.log('\n🔑 New Test Credentials:');
    console.log('   Email: test@glgcapital.com');
    console.log('   Password: TestPassword123!');
  } else {
    console.log('\n❌ Failed to create test user');
  }
}

main().catch(console.error); 