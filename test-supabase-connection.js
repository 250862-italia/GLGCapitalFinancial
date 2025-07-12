const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30'
};

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('=====================================');
  
  try {
    // Test 1: Create client with anon key
    console.log('\n1️⃣ Testing with Anonymous Key...');
    const supabaseAnon = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('count')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Anonymous key test failed:', anonError.message);
      console.log('   Error code:', anonError.code);
      console.log('   Details:', anonError.details);
    } else {
      console.log('✅ Anonymous key test successful');
    }

    // Test 2: Create client with service key
    console.log('\n2️⃣ Testing with Service Key...');
    const supabaseService = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);
    
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('users')
      .select('count')
      .limit(1);
    
    if (serviceError) {
      console.log('❌ Service key test failed:', serviceError.message);
      console.log('   Error code:', serviceError.code);
      console.log('   Details:', serviceError.details);
    } else {
      console.log('✅ Service key test successful');
    }

    // Test 3: Test basic REST API
    console.log('\n3️⃣ Testing REST API directly...');
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?select=count`, {
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });
    
    console.log('   Response status:', response.status);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ REST API test successful');
      console.log('   Response data:', data);
    } else {
      console.log('❌ REST API test failed');
      const errorText = await response.text();
      console.log('   Error response:', errorText);
    }

    // Test 4: Check if project is active
    console.log('\n4️⃣ Checking project status...');
    const healthResponse = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`);
    
    console.log('   Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Project is active');
      console.log('   Available endpoints:', healthData);
    } else {
      console.log('❌ Project might be inactive or suspended');
    }

  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    console.log('   Error type:', error.constructor.name);
    console.log('   Stack trace:', error.stack);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Connection test completed');
}

// Run the test
testSupabaseConnection().catch(console.error); 