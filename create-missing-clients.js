const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingClients() {
  try {
    console.log('🔧 Creating missing client records...');

    // 1. Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`👤 Found ${authUsers.users.length} users in auth.users`);

    // 2. Get all existing client records
    const { data: existingClients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id')
      .limit(1000);

    if (clientsError) {
      console.log('❌ Error fetching existing clients:', clientsError.message);
      return;
    }

    const existingClientUserIds = new Set(existingClients.map(c => c.user_id));
    console.log(`📊 Found ${existingClients.length} existing client records`);

    // 3. Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1000);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    const profileMap = new Map(profiles.map(p => [p.id, p]));
    console.log(`📋 Found ${profiles.length} profile records`);

    // 4. Find users without client records
    const usersWithoutClients = authUsers.users.filter(user => !existingClientUserIds.has(user.id));
    console.log(`⚠️ Found ${usersWithoutClients.length} users without client records`);

    if (usersWithoutClients.length === 0) {
      console.log('✅ All users already have client records!');
      return;
    }

    // 5. Create client records for missing users
    let createdCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutClients) {
      try {
        const profile = profileMap.get(user.id);
        
        const clientData = {
          user_id: user.id,
          profile_id: user.id,
          first_name: profile?.first_name || profile?.name?.split(' ')[0] || 'User',
          last_name: profile?.last_name || profile?.name?.split(' ').slice(1).join(' ') || 'User',
          email: user.email || profile?.email || '',
          phone: profile?.phone || '',
          company: profile?.company || '',
          position: profile?.position || '',
          date_of_birth: profile?.date_of_birth || null,
          nationality: profile?.nationality || '',
          profile_photo: profile?.profile_photo || '',
          address: profile?.address || '',
          city: profile?.city || '',
          country: profile?.country || '',
          postal_code: profile?.postal_code || '',
          iban: profile?.iban || '',
          bic: profile?.bic || '',
          account_holder: profile?.account_holder || '',
          usdt_wallet: profile?.usdt_wallet || '',
          client_code: 'CLI-' + user.id.substring(0, 8) + '-' + Math.floor(Math.random() * 1000),
          status: 'active'
        };

        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();

        if (createError) {
          console.log(`❌ Error creating client for ${user.email}:`, createError.message);
          errorCount++;
        } else {
          console.log(`✅ Created client for ${user.email} (${newClient.id})`);
          createdCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`❌ Error processing user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully created: ${createdCount} client records`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total users processed: ${usersWithoutClients.length}`);

    // 6. Verify the results
    const { data: finalClients, error: finalError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (finalError) {
      console.log('❌ Error checking final count:', finalError.message);
    } else {
      console.log(`📊 Total client records in database: ${finalClients[0]?.count || 0}`);
    }

    console.log('🎉 Client creation process completed!');

  } catch (error) {
    console.error('❌ Error in createMissingClients:', error);
  }
}

createMissingClients(); 