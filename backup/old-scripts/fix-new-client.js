require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixNewClient() {
  try {
    console.log('🔧 Fixing new client record...');
    
    // The new user ID from the logs
    const newUserId = '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f';
    const newUserEmail = 'info@washtw.it';
    
    console.log(`📧 Looking for user: ${newUserEmail} (${newUserId})`);
    
    // 1. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', newUserId)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      
      // Create profile if it doesn't exist
      console.log('📝 Creating missing profile...');
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          name: 'Francesco fra',
          email: newUserEmail,
          role: 'user',
          first_name: 'Francesco',
          last_name: 'fra',
          country: 'Madagascar',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
        return;
      }
      
      console.log('✅ Profile created:', newProfile);
    } else {
      console.log('✅ Profile found:', profile);
    }
    
    // 2. Check if client record exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', newUserId)
      .single();
    
    if (clientError && clientError.code === 'PGRST116') {
      console.log('⚠️ Client record not found, creating...');
      
      // Create client record
      const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          user_id: newUserId,
          profile_id: newUserId,
          first_name: 'Francesco',
          last_name: 'fra',
          email: newUserEmail,
          client_code: clientCode,
          status: 'active',
          risk_profile: 'moderate',
          investment_preferences: {},
          total_invested: 0.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createClientError) {
        console.error('❌ Error creating client:', createClientError);
        return;
      }
      
      console.log('✅ Client record created:', newClient);
    } else if (clientError) {
      console.error('❌ Error checking client:', clientError);
      return;
    } else {
      console.log('✅ Client record already exists:', client);
    }
    
    // 3. Verify the fix
    console.log('\n3️⃣ Verifying the fix...');
    
    const { data: finalClient, error: finalError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', newUserId)
      .single();
    
    if (finalError) {
      console.error('❌ Error verifying client:', finalError);
      return;
    }
    
    console.log('🎉 SUCCESS: Client record is now available!');
    console.log('📋 Client details:');
    console.log(`  - Name: ${finalClient.first_name} ${finalClient.last_name}`);
    console.log(`  - Email: ${finalClient.email}`);
    console.log(`  - Client Code: ${finalClient.client_code}`);
    console.log(`  - Status: ${finalClient.status}`);
    
    console.log('\n✅ The new client should now appear in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixNewClient(); 