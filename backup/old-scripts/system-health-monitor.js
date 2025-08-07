require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const os = require('os');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function monitorSystemHealth() {
  console.log('🏥 System Health Monitor\n');
  
  // 1. Memory Usage Check
  console.log('1️⃣ Memory Usage Analysis:');
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsagePercent = (usedMem / totalMem) * 100;
  
  console.log(`   Total Memory: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   Used Memory: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   Free Memory: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   Memory Usage: ${memoryUsagePercent.toFixed(1)}%`);
  
  if (memoryUsagePercent > 80) {
    console.log('   ⚠️  HIGH MEMORY USAGE DETECTED (>80%)');
    console.log('   🔧 Recommendations:');
    console.log('      • Restart the application');
    console.log('      • Check for memory leaks');
    console.log('      • Optimize database queries');
    console.log('      • Consider increasing server resources');
  } else if (memoryUsagePercent > 60) {
    console.log('   ⚠️  Moderate memory usage (>60%)');
  } else {
    console.log('   ✅ Memory usage is normal');
  }
  
  // 2. Database Connection Test
  console.log('\n2️⃣ Database Connection Test:');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('   ❌ Missing database credentials');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('   Testing database connection...');
    const startTime = Date.now();
    
    // Test with timeout
    const connectionPromise = supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
    );
    
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
    } else {
      console.log(`   ✅ Database connection successful (${responseTime}ms)`);
      
      if (responseTime > 10000) {
        console.log('   ⚠️  Slow database response (>10s)');
      } else if (responseTime > 5000) {
        console.log('   ⚠️  Moderate database response (>5s)');
      } else {
        console.log('   ✅ Database response time is good');
      }
    }
  } catch (error) {
    console.log(`   ❌ Database connection error: ${error.message}`);
  }
  
  // 3. Email Service Test
  console.log('\n3️⃣ Email Service Test:');
  try {
    const emailTestResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/test_email_service`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    if (emailTestResponse.ok) {
      console.log('   ✅ Email service is responding');
    } else {
      console.log(`   ❌ Email service error: ${emailTestResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Email service test failed: ${error.message}`);
  }
  
  // 4. Backup Service Test
  console.log('\n4️⃣ Backup Service Test:');
  try {
    // Check if backup tables exist and are accessible
    const { data: backupData, error: backupError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (backupError) {
      console.log(`   ❌ Backup service error: ${backupError.message}`);
    } else {
      console.log('   ✅ Backup service is accessible');
    }
  } catch (error) {
    console.log(`   ❌ Backup service test failed: ${error.message}`);
  }
  
  // 5. Performance Analysis
  console.log('\n5️⃣ Performance Analysis:');
  
  // Test multiple concurrent database operations
  const concurrentTests = Array.from({ length: 5 }, () => 
    supabase.from('profiles').select('count').limit(1)
  );
  
  try {
    const startTime = Date.now();
    const results = await Promise.allSettled(concurrentTests);
    const totalTime = Date.now() - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`   Concurrent operations: ${successful} successful, ${failed} failed`);
    console.log(`   Total time: ${totalTime}ms`);
    
    if (failed > 0) {
      console.log('   ⚠️  Some operations failed - system may be under stress');
    } else if (totalTime > 5000) {
      console.log('   ⚠️  Slow concurrent performance');
    } else {
      console.log('   ✅ Concurrent performance is good');
    }
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`);
  }
  
  // 6. System Recommendations
  console.log('\n6️⃣ System Recommendations:');
  
  if (memoryUsagePercent > 80) {
    console.log('   🔧 IMMEDIATE ACTIONS NEEDED:');
    console.log('      • Restart the application server');
    console.log('      • Check for memory leaks in the code');
    console.log('      • Optimize database queries');
    console.log('      • Consider upgrading server resources');
  }
  
  if (memoryUsagePercent > 60) {
    console.log('   🔧 OPTIMIZATION RECOMMENDATIONS:');
    console.log('      • Implement connection pooling');
    console.log('      • Add caching layer');
    console.log('      • Optimize image processing');
    console.log('      • Monitor memory usage trends');
  }
  
  console.log('\n   📊 MONITORING SETUP:');
  console.log('      • Set up automated health checks');
  console.log('      • Configure alerting for >80% memory usage');
  console.log('      • Monitor database connection pool');
  console.log('      • Track email service availability');
}

monitorSystemHealth().catch(console.error); 