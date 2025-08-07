const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'http://localhost:3001';

console.log('🔐 Testing Complete Admin Login System');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { response, data };
}

async function testAdminLogin() {
  console.log('1️⃣ Testing Admin Login Process\n');
  
  const adminCredentials = {
    email: 'admin@glgcapital.com',
    password: 'GLGAdmin2024!'
  };
  
  try {
    // Step 1: Get CSRF Token
    console.log('📋 Step 1: Getting CSRF Token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      console.log('   Response:', csrfResponse.status, csrfData);
      return false;
    }
    
    console.log('✅ CSRF token obtained');
    console.log(`   Token: ${csrfData.token.substring(0, 10)}...`);

    // Step 2: Test Admin Login
    console.log('\n📋 Step 2: Testing Admin Login...');
    const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(adminCredentials)
    });

    console.log('📊 Admin Login Response:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success || false}`);
    console.log(`   Error: ${loginData.error || 'None'}`);

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Admin login successful!');
      console.log(`   User: ${loginData.user.name}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Email: ${loginData.user.email}`);
      return true;
    } else {
      console.log('❌ Admin login failed');
      console.log(`   Error: ${loginData.error}`);
      return false;
    }

  } catch (error) {
    console.log('❌ Error during admin login test:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n2️⃣ Testing User Login Process\n');
  
  const userCredentials = {
    email: 'innocentigianni2015@gmail.com',
    password: '123Admin'
  };
  
  try {
    // Step 1: Get CSRF Token
    console.log('📋 Step 1: Getting CSRF Token...');
    const { response: csrfResponse, data: csrfData } = await makeRequest(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok || !csrfData.token) {
      console.log('❌ Failed to get CSRF token');
      return false;
    }
    
    console.log('✅ CSRF token obtained');

    // Step 2: Test User Login
    console.log('\n📋 Step 2: Testing User Login...');
    const { response: loginResponse, data: loginData } = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfData.token
      },
      body: JSON.stringify(userCredentials)
    });

    console.log('📊 User Login Response:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success || false}`);
    console.log(`   Error: ${loginData.error || 'None'}`);

    if (loginResponse.ok && loginData.success) {
      console.log('✅ User login successful!');
      console.log(`   User: ${loginData.user?.name || 'N/A'}`);
      console.log(`   Email: ${loginData.user?.email || 'N/A'}`);
      return true;
    } else {
      console.log('❌ User login failed');
      console.log(`   Error: ${loginData.error}`);
      return false;
    }

  } catch (error) {
    console.log('❌ Error during user login test:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n3️⃣ Testing Database Connection\n');
  
  try {
    // Test profiles table
    console.log('📋 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      return false;
    }
    console.log('✅ Profiles table accessible');

    // Test clients table
    console.log('📋 Testing clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Clients table error:', clientsError.message);
      return false;
    }
    console.log('✅ Clients table accessible');

    // Test investments table
    console.log('📋 Testing investments table...');
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('count')
      .limit(1);
    
    if (investmentsError) {
      console.log('❌ Investments table error:', investmentsError.message);
      return false;
    }
    console.log('✅ Investments table accessible');

    return true;

  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

async function testWebsiteAccess() {
  console.log('\n4️⃣ Testing Website Access\n');
  
  try {
    // Test main page
    console.log('📋 Testing main page...');
    const { response: mainResponse } = await makeRequest(`${BASE_URL}/`);
    
    if (mainResponse.ok) {
      console.log('✅ Main page accessible');
    } else {
      console.log(`❌ Main page error: ${mainResponse.status}`);
    }

    // Test admin login page
    console.log('📋 Testing admin login page...');
    const { response: adminLoginResponse } = await makeRequest(`${BASE_URL}/admin/login`);
    
    if (adminLoginResponse.ok) {
      console.log('✅ Admin login page accessible');
    } else {
      console.log(`❌ Admin login page error: ${adminLoginResponse.status}`);
    }

    // Test user login page
    console.log('📋 Testing user login page...');
    const { response: userLoginResponse } = await makeRequest(`${BASE_URL}/login`);
    
    if (userLoginResponse.ok) {
      console.log('✅ User login page accessible');
    } else {
      console.log(`❌ User login page error: ${userLoginResponse.status}`);
    }

    return true;

  } catch (error) {
    console.log('❌ Website access error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting comprehensive login test...\n');
  
  const results = {
    adminLogin: false,
    userLogin: false,
    database: false,
    website: false
  };
  
  // Test admin login
  results.adminLogin = await testAdminLogin();
  
  // Test user login
  results.userLogin = await testUserLogin();
  
  // Test database connection
  results.database = await testDatabaseConnection();
  
  // Test website access
  results.website = await testWebsiteAccess();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Admin Login: ${results.adminLogin ? 'PASS' : 'FAIL'}`);
  console.log(`✅ User Login: ${results.userLogin ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Database Connection: ${results.database ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Website Access: ${results.website ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! The login system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above.');
  }
  
  console.log('\n🔑 Admin Credentials:');
  console.log('   Email: admin@glgcapital.com');
  console.log('   Password: GLGAdmin2024!');
  
  console.log('\n👤 User Credentials:');
  console.log('   Email: innocentigianni2015@gmail.com');
  console.log('   Password: 123Admin');
}

main().catch(console.error); 