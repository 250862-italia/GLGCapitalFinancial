require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testProfilesFix() {
  console.log('🔧 Testing profiles table fix...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test 1: Check if we can query profiles using id instead of user_id
    console.log('\n📊 Test 1: Querying profiles with id...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles query error:', profilesError.message);
    } else {
      console.log('✅ Profiles query successful');
      if (profiles && profiles.length > 0) {
        console.log('Sample profile:', profiles[0]);
      }
    }
    
    // Test 2: Check if we can insert a profile with id as user_id
    console.log('\n➕ Test 2: Testing profile insertion...');
    const testUserId = 'test-user-' + Date.now();
    const testProfile = {
      id: testUserId, // Use id instead of user_id
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select();
    
    if (insertError) {
      console.log('❌ Profile insertion error:', insertError.message);
    } else {
      console.log('✅ Profile insertion successful');
      console.log('Inserted profile:', insertResult[0]);
      
      // Clean up
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('🧹 Test profile cleaned up');
    }
    
    // Test 3: Check if we can query by id
    console.log('\n🔍 Test 3: Querying profile by id...');
    if (profiles && profiles.length > 0) {
      const testId = profiles[0].id;
      const { data: singleProfile, error: singleError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (singleError) {
        console.log('❌ Single profile query error:', singleError.message);
      } else {
        console.log('✅ Single profile query successful');
        console.log('Profile found:', singleProfile);
      }
    }
    
    // Test 4: Check clients table relationship
    console.log('\n🔗 Test 4: Checking clients table relationship...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id, profile_id, first_name, last_name')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Clients query error:', clientsError.message);
    } else {
      console.log('✅ Clients query successful');
      if (clients && clients.length > 0) {
        console.log('Sample client:', clients[0]);
        
        // Check if we can find the corresponding profile
        const clientUserId = clients[0].user_id;
        const { data: relatedProfile, error: relatedError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientUserId)
          .single();
        
        if (relatedError) {
          console.log('❌ Related profile query error:', relatedError.message);
        } else {
          console.log('✅ Related profile found:', relatedProfile);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testProfilesFix().catch(console.error); 