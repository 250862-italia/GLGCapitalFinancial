const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  try {
    console.log('🔍 Testing different column names...');
    
    // Test 1: Try with email
    console.log('📝 Test 1: Trying with email column...');
    try {
      const { data, error } = await supabase
        .from('informational_requests')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (error) {
        console.log('❌ Test 1 failed:', error.message);
      } else {
        console.log('✅ Test 1 successful:', data.id);
        // Clean up
        await supabase.from('informational_requests').delete().eq('id', data.id);
        return;
      }
    } catch (e) {
      console.log('❌ Test 1 exception:', e.message);
    }
    
    // Test 2: Try with user_email
    console.log('📝 Test 2: Trying with user_email column...');
    try {
      const { data, error } = await supabase
        .from('informational_requests')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          user_email: 'test@example.com',
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (error) {
        console.log('❌ Test 2 failed:', error.message);
      } else {
        console.log('✅ Test 2 successful:', data.id);
        // Clean up
        await supabase.from('informational_requests').delete().eq('id', data.id);
        return;
      }
    } catch (e) {
      console.log('❌ Test 2 exception:', e.message);
    }
    
    // Test 3: Try with contact_email
    console.log('📝 Test 3: Trying with contact_email column...');
    try {
      const { data, error } = await supabase
        .from('informational_requests')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          contact_email: 'test@example.com',
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (error) {
        console.log('❌ Test 3 failed:', error.message);
      } else {
        console.log('✅ Test 3 successful:', data.id);
        // Clean up
        await supabase.from('informational_requests').delete().eq('id', data.id);
        return;
      }
    } catch (e) {
      console.log('❌ Test 3 exception:', e.message);
    }
    
    console.log('❌ All tests failed');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testInsert(); 