require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixClientCreation() {
  try {
    console.log('🔧 Fixing client creation issue...');
    
    // 1. Check current state
    console.log('\n1️⃣ Checking current state...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('role', 'user');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id, email, first_name, last_name');
    
    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError);
      return;
    }
    
    console.log(`📊 Found ${profiles.length} profiles and ${clients.length} clients`);
    
    // 2. Find profiles without client records
    const profilesWithoutClients = profiles.filter(profile => 
      !clients.some(client => client.user_id === profile.id)
    );
    
    console.log(`⚠️ Found ${profilesWithoutClients.length} profiles without client records`);
    
    if (profilesWithoutClients.length === 0) {
      console.log('✅ All profiles already have client records!');
      return;
    }
    
    // 3. Create client records for missing profiles
    console.log('\n2️⃣ Creating client records for missing profiles...');
    
    for (const profile of profilesWithoutClients) {
      const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const clientData = {
        user_id: profile.id,
        profile_id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email,
        client_code: clientCode,
        status: 'active',
        risk_profile: 'moderate',
        investment_preferences: {},
        total_invested: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (clientError) {
        console.error(`❌ Error creating client for ${profile.email}:`, clientError);
      } else {
        console.log(`✅ Created client record for ${profile.email} (${newClient.client_code})`);
      }
    }
    
    // 4. Verify the fix
    console.log('\n3️⃣ Verifying the fix...');
    
    const { data: finalClients, error: finalError } = await supabase
      .from('clients')
      .select('user_id, email, first_name, last_name, client_code');
    
    if (finalError) {
      console.error('❌ Error fetching final clients:', finalError);
      return;
    }
    
    const finalProfilesWithoutClients = profiles.filter(profile => 
      !finalClients.some(client => client.user_id === profile.id)
    );
    
    console.log(`📊 Final state: ${profiles.length} profiles, ${finalClients.length} clients`);
    console.log(`✅ Profiles without clients: ${finalProfilesWithoutClients.length}`);
    
    if (finalProfilesWithoutClients.length === 0) {
      console.log('🎉 SUCCESS: All profiles now have client records!');
      console.log('\n📋 Client records created:');
      finalClients.forEach(client => {
        console.log(`  - ${client.email} (${client.client_code})`);
      });
    } else {
      console.log('⚠️ Some profiles still don\'t have client records');
      finalProfilesWithoutClients.forEach(profile => {
        console.log(`  - ${profile.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixClientCreation(); 