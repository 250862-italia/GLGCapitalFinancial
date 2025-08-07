require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function diagnoseDatabase() {
  console.log('🔍 Database Diagnosis Tool\n');
  
  // Check environment variables
  console.log('1️⃣ Environment Variables Check:');
  console.log('   SUPABASE_URL:', SUPABASE_URL ? '✅ Present' : '❌ Missing');
  console.log('   SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Present' : '❌ Missing');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('\n❌ Missing required environment variables');
    return;
  }
  
  // Create clients
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseAdmin = SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;
  
  console.log('\n2️⃣ Connection Tests:');
  
  // Test 1: Basic connection
  try {
    console.log('   Testing basic connection...');
    const startTime = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    } else {
      console.log(`   ✅ Connection successful (${responseTime}ms)`);
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error.message}`);
  }
  
  // Test 2: Database query
  try {
    console.log('   Testing database query...');
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`   ❌ Query failed: ${error.message}`);
    } else {
      console.log(`   ✅ Query successful (${responseTime}ms)`);
    }
  } catch (error) {
    console.log(`   ❌ Query error: ${error.message}`);
  }
  
  // Test 3: Admin connection
  if (supabaseAdmin) {
    try {
      console.log('   Testing admin connection...');
      const startTime = Date.now();
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.log(`   ❌ Admin query failed: ${error.message}`);
      } else {
        console.log(`   ✅ Admin query successful (${responseTime}ms)`);
      }
    } catch (error) {
      console.log(`   ❌ Admin query error: ${error.message}`);
    }
  }
  
  // Test 4: Check specific tables
  console.log('\n3️⃣ Table Health Check:');
  const tables = ['profiles', 'clients', 'investments', 'packages'];
  
  for (const table of tables) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: OK (${responseTime}ms)`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    }
  }
  
  // Test 5: Performance test
  console.log('\n4️⃣ Performance Test:');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .limit(10);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`   ❌ Performance test failed: ${error.message}`);
    } else {
      console.log(`   ✅ Performance test: ${data?.length || 0} records in ${responseTime}ms`);
      
      if (responseTime > 1000) {
        console.log('   ⚠️  Slow response time detected (>1s)');
      } else if (responseTime > 500) {
        console.log('   ⚠️  Moderate response time (>500ms)');
      } else {
        console.log('   ✅ Good response time');
      }
    }
  } catch (error) {
    console.log(`   ❌ Performance test error: ${error.message}`);
  }
  
  // Test 6: Check Supabase status
  console.log('\n5️⃣ Supabase Status Check:');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Supabase REST API: Healthy');
    } else {
      console.log(`   ❌ Supabase REST API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Supabase REST API error: ${error.message}`);
  }
  
  console.log('\n6️⃣ Recommendations:');
  console.log('   • Check Supabase dashboard for any ongoing issues');
  console.log('   • Verify your Supabase project is not paused');
  console.log('   • Check if you have reached any usage limits');
  console.log('   • Consider upgrading your Supabase plan if needed');
  console.log('   • Monitor response times during peak usage');
}

diagnoseDatabase().catch(console.error); 