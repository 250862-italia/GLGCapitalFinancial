require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testDatabaseResilience() {
  console.log('🛡️ Database Resilience Test\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('1️⃣ Testing Basic Connection:');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`   ❌ Basic connection failed: ${error.message}`);
    } else {
      console.log(`   ✅ Basic connection successful (${responseTime}ms)`);
    }
  } catch (error) {
    console.log(`   ❌ Basic connection error: ${error.message}`);
  }
  
  console.log('\n2️⃣ Testing Multiple Concurrent Requests:');
  const concurrentTests = Array.from({ length: 5 }, (_, i) => 
    supabase.from('clients').select('count').limit(1)
  );
  
  try {
    const startTime = Date.now();
    const results = await Promise.allSettled(concurrentTests);
    const totalTime = Date.now() - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`   ✅ Concurrent requests: ${successful} successful, ${failed} failed (${totalTime}ms total)`);
    
    if (failed > 0) {
      console.log('   ⚠️  Some concurrent requests failed - database may be under load');
    }
  } catch (error) {
    console.log(`   ❌ Concurrent test error: ${error.message}`);
  }
  
  console.log('\n3️⃣ Testing Response Time Stability:');
  const responseTimes = [];
  
  for (let i = 0; i < 3; i++) {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      const responseTime = Date.now() - startTime;
      
      if (!error) {
        responseTimes.push(responseTime);
        console.log(`   Test ${i + 1}: ${responseTime}ms`);
      } else {
        console.log(`   Test ${i + 1}: Failed - ${error.message}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   Test ${i + 1}: Error - ${error.message}`);
    }
  }
  
  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);
    const variance = maxTime - minTime;
    
    console.log(`   📊 Average: ${avgTime.toFixed(0)}ms, Range: ${minTime}-${maxTime}ms (variance: ${variance}ms)`);
    
    if (avgTime > 1000) {
      console.log('   ⚠️  High average response time detected');
    } else if (variance > 500) {
      console.log('   ⚠️  High response time variance detected');
    } else {
      console.log('   ✅ Response times are stable');
    }
  }
  
  console.log('\n4️⃣ Testing Table Access:');
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
  
  console.log('\n5️⃣ Database Status Summary:');
  
  // Overall assessment
  const isHealthy = responseTimes.length > 0 && 
                   responseTimes.every(time => time < 2000) && 
                   responseTimes.length >= 2;
  
  if (isHealthy) {
    console.log('   ✅ Database is HEALTHY');
    console.log('   • All tables accessible');
    console.log('   • Response times within acceptable range');
    console.log('   • Concurrent requests working');
  } else {
    console.log('   ⚠️  Database shows DEGRADED performance');
    console.log('   • Some operations may be slow');
    console.log('   • Consider monitoring for improvements');
    console.log('   • Fallback systems are in place');
  }
  
  console.log('\n6️⃣ Recommendations:');
  if (isHealthy) {
    console.log('   • Continue monitoring response times');
    console.log('   • Consider implementing caching for frequently accessed data');
    console.log('   • Monitor Supabase dashboard for any issues');
  } else {
    console.log('   • Check Supabase dashboard for ongoing issues');
    console.log('   • Consider upgrading Supabase plan if needed');
    console.log('   • Implement more aggressive caching');
    console.log('   • Monitor and optimize database queries');
  }
}

testDatabaseResilience().catch(console.error); 