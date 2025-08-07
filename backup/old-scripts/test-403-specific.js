require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSpecificOperations() {
  console.log('🔍 Testing specific operations that might cause 403...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test 1: Profile operations
    console.log('\n👤 Test 1: Profile operations...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message, `(${profileError.code})`);
    } else {
      console.log('✅ Profile access: OK');
    }
    
    // Test 2: Client operations
    console.log('\n🏢 Test 2: Client operations...');
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientError) {
      console.log('❌ Client error:', clientError.message, `(${clientError.code})`);
    } else {
      console.log('✅ Client access: OK');
    }
    
    // Test 3: Investment operations
    console.log('\n💰 Test 3: Investment operations...');
    const { data: investments, error: investmentError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);
    
    if (investmentError) {
      console.log('❌ Investment error:', investmentError.message, `(${investmentError.code})`);
    } else {
      console.log('✅ Investment access: OK');
    }
    
    // Test 4: Package operations
    console.log('\n📦 Test 4: Package operations...');
    const { data: packages, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);
    
    if (packageError) {
      console.log('❌ Package error:', packageError.message, `(${packageError.code})`);
    } else {
      console.log('✅ Package access: OK');
    }
    
    // Test 5: Insert operations (most likely to cause 403)
    console.log('\n➕ Test 5: Insert operations...');
    
    // Test profile insert
    const testProfile = {
      id: 'test-' + Date.now(),
      user_id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const { data: insertProfile, error: insertProfileError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select();
    
    if (insertProfileError) {
      console.log('❌ Profile insert error:', insertProfileError.message, `(${insertProfileError.code})`);
    } else {
      console.log('✅ Profile insert: OK');
      // Clean up
      await supabase.from('profiles').delete().eq('id', testProfile.id);
    }
    
    // Test 6: Update operations
    console.log('\n✏️ Test 6: Update operations...');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 'non-existent-id')
      .select();
    
    if (updateError) {
      console.log('❌ Update error:', updateError.message, `(${updateError.code})`);
    } else {
      console.log('✅ Update operation: OK');
    }
    
    // Test 7: Delete operations
    console.log('\n🗑️ Test 7: Delete operations...');
    const { data: deleteResult, error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', 'non-existent-id');
    
    if (deleteError) {
      console.log('❌ Delete error:', deleteError.message, `(${deleteError.code})`);
    } else {
      console.log('✅ Delete operation: OK');
    }
    
    // Test 8: RLS policy check
    console.log('\n🔐 Test 8: RLS policy check...');
    const { data: policyCheck, error: policyError } = await supabase
      .rpc('check_rls_policies');
    
    if (policyError) {
      console.log('❌ RLS policy check error:', policyError.message);
    } else {
      console.log('✅ RLS policy check: OK');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testSpecificOperations().catch(console.error); 