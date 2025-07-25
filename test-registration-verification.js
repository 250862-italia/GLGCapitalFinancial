require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function testRegistrationAndVerification() {
  console.log('👤 Testing User Registration and Supabase Verification\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Empty');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Empty');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Get CSRF Token
    console.log('1️⃣ Getting CSRF Token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      console.log('   Response:', csrfResponse.status, csrfData);
      return;
    }
    
    console.log('✅ CSRF token obtained');
    console.log(`   Token: ${csrfData.token.substring(0, 10)}...`);

    // Step 2: Register New User
    console.log('\n2️⃣ Registering New User...');
    const registrationData = {
      email: testEmail,
      password: testPassword,
      firstName: 'Mario',
      lastName: 'Rossi',
      country: 'Italy'
    };

    console.log('   Registration data:', {
      email: testEmail,
      firstName: 'Mario',
      lastName: 'Rossi',
      country: 'Italy'
    });

    const { response: regResponse, data: regData } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(registrationData)
    });

    if (regResponse.ok && regData.success) {
      console.log('✅ User registration successful!');
      console.log(`   Email: ${testEmail}`);
      console.log(`   User ID: ${regData.userId || 'N/A'}`);
      console.log(`   Message: ${regData.message || 'N/A'}`);
    } else {
      console.log('❌ User registration failed');
      console.log('   Response:', regResponse.status, regData);
      return;
    }

    // Step 3: Wait a moment for database sync
    console.log('\n3️⃣ Waiting for database sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Verify User in Supabase - Profiles Table
    console.log('\n4️⃣ Verifying User in Supabase Profiles Table...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', testEmail);

      if (profilesError) {
        console.log('❌ Error checking profiles table:', profilesError.message);
      } else {
        console.log('✅ Profiles query successful');
        console.log(`   Found ${profiles?.length || 0} profile(s)`);
        
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          console.log('   Profile details:');
          console.log(`     ID: ${profile.id}`);
          console.log(`     Email: ${profile.email}`);
          console.log(`     First Name: ${profile.first_name}`);
          console.log(`     Last Name: ${profile.last_name}`);
          console.log(`     Country: ${profile.country}`);
          console.log(`     Created At: ${profile.created_at}`);
          console.log(`     User ID: ${profile.user_id || 'NULL'}`);
        } else {
          console.log('   ❌ No profile found for this email');
        }
      }
    } catch (error) {
      console.log('❌ Exception checking profiles:', error.message);
    }

    // Step 5: Verify User in Supabase - Clients Table
    console.log('\n5️⃣ Verifying User in Supabase Clients Table...');
    try {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', testEmail);

      if (clientsError) {
        console.log('❌ Error checking clients table:', clientsError.message);
      } else {
        console.log('✅ Clients query successful');
        console.log(`   Found ${clients?.length || 0} client(s)`);
        
        if (clients && clients.length > 0) {
          const client = clients[0];
          console.log('   Client details:');
          console.log(`     ID: ${client.id}`);
          console.log(`     Email: ${client.email}`);
          console.log(`     First Name: ${client.first_name}`);
          console.log(`     Last Name: ${client.last_name}`);
          console.log(`     Country: ${client.country}`);
          console.log(`     Created At: ${client.created_at}`);
          console.log(`     User ID: ${client.user_id || 'NULL'}`);
        } else {
          console.log('   ❌ No client found for this email');
        }
      }
    } catch (error) {
      console.log('❌ Exception checking clients:', error.message);
    }

    // Step 6: Try to access auth.users (this might fail due to permissions)
    console.log('\n6️⃣ Attempting to check auth.users table...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', testEmail);

      if (authError) {
        console.log('⚠️  Cannot access auth.users table (normal - restricted access)');
        console.log('   Error:', authError.message);
        console.log('   This is expected - auth.users is managed internally by Supabase');
      } else {
        console.log('✅ Auth users query successful');
        console.log(`   Found ${authUsers?.length || 0} auth user(s)`);
        
        if (authUsers && authUsers.length > 0) {
          const authUser = authUsers[0];
          console.log('   Auth user details:');
          console.log(`     ID: ${authUser.id}`);
          console.log(`     Email: ${authUser.email}`);
          console.log(`     Created At: ${authUser.created_at}`);
          console.log(`     Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
        }
      }
    } catch (error) {
      console.log('❌ Exception checking auth.users:', error.message);
    }

    // Step 7: Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`   Test Email: ${testEmail}`);
    console.log(`   Registration: ${regResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Check if user exists in both tables
    const { data: finalProfiles } = await supabase.from('profiles').select('id').eq('email', testEmail);
    const { data: finalClients } = await supabase.from('clients').select('id').eq('email', testEmail);
    
    console.log(`   Profile in Database: ${finalProfiles && finalProfiles.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`   Client in Database: ${finalClients && finalClients.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    if (regResponse.ok && finalProfiles && finalProfiles.length > 0 && finalClients && finalClients.length > 0) {
      console.log('\n🎉 SUCCESS! User registration and database storage working perfectly!');
      console.log('   You can now check this user in your Supabase dashboard:');
      console.log(`   - Email: ${testEmail}`);
      console.log(`   - Check tables: profiles, clients`);
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Some issues detected');
      console.log('   Check the details above for specific problems');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRegistrationAndVerification(); 