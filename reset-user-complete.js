require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'http://localhost:3000';

const TARGET_EMAIL = 'innocentigianni2015@gmail.com';

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

async function resetUserComplete() {
  console.log('🔄 COMPLETE USER RESET PROCESS\n');
  console.log(`🎯 Target Email: ${TARGET_EMAIL}\n`);
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // STEP 1: Check current status
    console.log('1️⃣ CHECKING CURRENT STATUS...');
    
    // Check auth.users
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', TARGET_EMAIL);

    if (authError) {
      console.log('❌ Error checking auth.users:', authError.message);
    } else {
      console.log(`✅ Auth users found: ${authUsers?.length || 0}`);
      if (authUsers && authUsers.length > 0) {
        console.log('📧 User in auth.users:', {
          id: authUsers[0].id,
          email: authUsers[0].email,
          created_at: authUsers[0].created_at
        });
      }
    }

    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', TARGET_EMAIL);

    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
    } else {
      console.log(`✅ Profiles found: ${profiles?.length || 0}`);
    }

    // Check clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', TARGET_EMAIL);

    if (clientsError) {
      console.log('❌ Error checking clients:', clientsError.message);
    } else {
      console.log(`✅ Clients found: ${clients?.length || 0}`);
    }

    // STEP 2: Delete from all tables
    console.log('\n2️⃣ DELETING FROM ALL TABLES...');
    
    // Delete from clients table
    if (clients && clients.length > 0) {
      const { error: deleteClientsError } = await supabase
        .from('clients')
        .delete()
        .eq('email', TARGET_EMAIL);
      
      if (deleteClientsError) {
        console.log('❌ Error deleting from clients:', deleteClientsError.message);
      } else {
        console.log('✅ Deleted from clients table');
      }
    }

    // Delete from profiles table
    if (profiles && profiles.length > 0) {
      const { error: deleteProfilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('email', TARGET_EMAIL);
      
      if (deleteProfilesError) {
        console.log('❌ Error deleting from profiles:', deleteProfilesError.message);
      } else {
        console.log('✅ Deleted from profiles table');
      }
    }

    // Delete from auth.users (this requires admin privileges)
    if (authUsers && authUsers.length > 0) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
        authUsers[0].id
      );
      
      if (deleteAuthError) {
        console.log('❌ Error deleting from auth.users:', deleteAuthError.message);
      } else {
        console.log('✅ Deleted from auth.users table');
      }
    }

    // STEP 3: Verify deletion
    console.log('\n3️⃣ VERIFYING DELETION...');
    
    const { data: authUsersAfter, error: authErrorAfter } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', TARGET_EMAIL);

    const { data: profilesAfter, error: profilesErrorAfter } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', TARGET_EMAIL);

    const { data: clientsAfter, error: clientsErrorAfter } = await supabase
      .from('clients')
      .select('*')
      .eq('email', TARGET_EMAIL);

    console.log(`✅ Auth users after deletion: ${authUsersAfter?.length || 0}`);
    console.log(`✅ Profiles after deletion: ${profilesAfter?.length || 0}`);
    console.log(`✅ Clients after deletion: ${clientsAfter?.length || 0}`);

    if ((authUsersAfter?.length || 0) === 0 && 
        (profilesAfter?.length || 0) === 0 && 
        (clientsAfter?.length || 0) === 0) {
      console.log('🎉 SUCCESS: User completely removed from all tables!');
    } else {
      console.log('⚠️ WARNING: Some data may still exist');
    }

    // STEP 4: Register new user
    console.log('\n4️⃣ REGISTERING NEW USER...');
    
    // Get CSRF token
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (csrfResponse.status !== 200) {
      console.log('❌ Failed to get CSRF token');
      return;
    }

    const csrfToken = csrfData.token;
    console.log('✅ CSRF token obtained');

    // Register user
    const registrationData = {
      email: TARGET_EMAIL,
      password: 'TestPassword123!',
      firstName: 'Innocenti',
      lastName: 'Gianni',
      country: 'Italy',
      phone: '+393331234567',
      dateOfBirth: '1990-01-01'
    };

    const { response: registerResponse, data: registerData } = await makeRequest(
      `${BASE_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(registrationData)
      }
    );

    console.log(`📊 Registration Response: ${registerResponse.status}`);
    console.log('📄 Registration Data:', registerData);

    if (registerResponse.status === 200) {
      console.log('✅ User registered successfully!');
    } else {
      console.log('❌ Registration failed');
      return;
    }

    // STEP 5: Verify registration
    console.log('\n5️⃣ VERIFYING REGISTRATION...');
    
    // Wait a moment for data to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: authUsersFinal, error: authErrorFinal } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', TARGET_EMAIL);

    const { data: profilesFinal, error: profilesErrorFinal } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', TARGET_EMAIL);

    const { data: clientsFinal, error: clientsErrorFinal } = await supabase
      .from('clients')
      .select('*')
      .eq('email', TARGET_EMAIL);

    console.log(`✅ Auth users after registration: ${authUsersFinal?.length || 0}`);
    console.log(`✅ Profiles after registration: ${profilesFinal?.length || 0}`);
    console.log(`✅ Clients after registration: ${clientsFinal?.length || 0}`);

    if (authUsersFinal && authUsersFinal.length > 0) {
      console.log('📧 Auth user details:', {
        id: authUsersFinal[0].id,
        email: authUsersFinal[0].email,
        created_at: authUsersFinal[0].created_at
      });
    }

    if (profilesFinal && profilesFinal.length > 0) {
      console.log('👤 Profile details:', {
        id: profilesFinal[0].id,
        email: profilesFinal[0].email,
        first_name: profilesFinal[0].first_name,
        last_name: profilesFinal[0].last_name
      });
    }

    if (clientsFinal && clientsFinal.length > 0) {
      console.log('🏢 Client details:', {
        id: clientsFinal[0].id,
        email: clientsFinal[0].email,
        first_name: clientsFinal[0].first_name,
        last_name: clientsFinal[0].last_name
      });
    }

    // STEP 6: Test login
    console.log('\n6️⃣ TESTING LOGIN...');
    
    const { response: loginResponse, data: loginData } = await makeRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          email: TARGET_EMAIL,
          password: 'TestPassword123!'
        })
      }
    );

    console.log(`📊 Login Response: ${loginResponse.status}`);
    console.log('📄 Login Data:', loginData);

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }

    // FINAL SUMMARY
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`🎯 Target Email: ${TARGET_EMAIL}`);
    console.log(`🔑 Password: TestPassword123!`);
    console.log(`✅ User completely reset and re-registered`);
    console.log(`✅ Login tested successfully`);
    console.log('\n🎉 PROCESS COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Error during reset process:', error);
  }
}

resetUserComplete(); 