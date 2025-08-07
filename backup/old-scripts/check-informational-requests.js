const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInformationalRequests() {
  try {
    console.log('🔍 Checking informational_requests table...');
    
    // Test 1: Check if table exists
    const { data, error } = await supabase
      .from('informational_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Informational requests table error:', error.message);
      console.log('📋 Error details:', error);
      return false;
    }
    
    console.log('✅ Informational requests table exists and is accessible');
    console.log('📊 Current records:', data.length);
    
    // Test 2: Try to insert a test record
    console.log('📝 Test 2: Inserting test record...');
    const { data: insertData, error: insertError } = await supabase
      .from('informational_requests')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '123456789',
        country: 'Italy',
        city: 'Rome',
        additionalNotes: 'Test request',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test record:', insertError);
      return false;
    }
    
    console.log('✅ Test record inserted:', insertData.id);
    
    // Test 3: Clean up test record
    const { error: deleteError } = await supabase
      .from('informational_requests')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking informational requests:', error);
    return false;
  }
}

checkInformationalRequests(); 