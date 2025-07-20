const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingClients() {
  try {
    console.log('🔧 Fixing missing client records...');
    
    // 1. Get all profiles that are users (not admins)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`📋 Found ${profiles.length} user profiles`);
    
    // 2. Get all existing clients
    const { data: existingClients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id');
    
    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError);
      return;
    }
    
    const existingClientUserIds = new Set(existingClients.map(c => c.user_id));
    console.log(`📋 Found ${existingClients.length} existing clients`);
    
    // 3. Find profiles without client records
    const profilesWithoutClients = profiles.filter(profile => !existingClientUserIds.has(profile.id));
    
    console.log(`📋 Found ${profilesWithoutClients.length} profiles without client records`);
    
    if (profilesWithoutClients.length === 0) {
      console.log('✅ All profiles already have client records!');
      return;
    }
    
    // 4. Create missing client records
    let createdCount = 0;
    let errorCount = 0;
    
    for (const profile of profilesWithoutClients) {
      try {
        const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const clientData = {
          user_id: profile.id,
          profile_id: profile.id,
          first_name: profile.first_name || profile.name?.split(' ')[0] || 'User',
          last_name: profile.last_name || profile.name?.split(' ').slice(1).join(' ') || 'User',
          email: profile.email,
          phone: profile.phone || '',
          company: '',
          position: '',
          date_of_birth: null,
          nationality: '',
          profile_photo: '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          postal_code: profile.postal_code || '',
          iban: '',
          bic: '',
          account_holder: '',
          usdt_wallet: '',
          client_code: clientCode,
          status: 'active',
          risk_profile: 'moderate',
          investment_preferences: {},
          total_invested: 0.00,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString()
        };
        
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();
        
        if (createError) {
          console.log(`❌ Error creating client for ${profile.email}:`, createError.message);
          errorCount++;
        } else {
          console.log(`✅ Created client for ${profile.email} (${newClient.id})`);
          createdCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error processing profile ${profile.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Created: ${createdCount} client records`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📋 Total profiles processed: ${profilesWithoutClients.length}`);
    
    // 5. Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: finalClients, error: verifyError } = await supabase
      .from('clients')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log(`✅ Total clients in database: ${finalClients.length}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixMissingClients(); 