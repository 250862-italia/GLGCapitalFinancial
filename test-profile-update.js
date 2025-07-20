const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileUpdate() {
  try {
    console.log('🧪 Testing profile update functionality...');

    // 1. Check if there are any users in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`👤 Found ${authUsers.users.length} users in auth.users`);
      
      if (authUsers.users.length > 0) {
        console.log('👥 Sample auth users:');
        authUsers.users.slice(0, 3).forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.id}) - Created: ${user.created_at}`);
        });
      }
    }

    // 2. Check if there are any client records
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`📊 Found ${clients.length} client records`);
      
      if (clients.length > 0) {
        console.log('👥 Sample clients:');
        clients.forEach((client, index) => {
          console.log(`  ${index + 1}. ${client.first_name} ${client.last_name} (${client.email}) - User ID: ${client.user_id}`);
        });
      }
    }

    // 3. Check if there are any profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`📋 Found ${profiles.length} profile records`);
      
      if (profiles.length > 0) {
        console.log('👥 Sample profiles:');
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.name} (${profile.email}) - Role: ${profile.role}`);
        });
      }
    }

    // 4. Test creating a client record manually
    if (authUsers.users.length > 0) {
      const testUser = authUsers.users[0];
      console.log(`\n🧪 Testing client creation for user: ${testUser.email}`);
      
      const testClientData = {
        user_id: testUser.id,
        first_name: 'Test',
        last_name: 'User',
        email: testUser.email,
        phone: '+1234567890',
        company: 'Test Company',
        position: 'Test Position',
        date_of_birth: '1990-01-01',
        nationality: 'Test Nationality',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        postal_code: '12345',
        status: 'active'
      };

      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert(testClientData)
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating test client:', createError.message);
      } else {
        console.log('✅ Test client created successfully:', newClient);
        
        // Clean up - delete the test client
        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .eq('id', newClient.id);
        
        if (deleteError) {
          console.log('⚠️ Error deleting test client:', deleteError.message);
        } else {
          console.log('✅ Test client cleaned up');
        }
      }
    }

    // 5. Check the relationship between auth.users and clients
    if (authUsers.users.length > 0 && clients.length > 0) {
      console.log('\n🔍 Checking user-client relationships...');
      
      const userIds = authUsers.users.map(u => u.id);
      const clientUserIds = clients.map(c => c.user_id);
      
      const usersWithoutClients = userIds.filter(id => !clientUserIds.includes(id));
      const clientsWithoutUsers = clientUserIds.filter(id => !userIds.includes(id));
      
      console.log(`👤 Users without client records: ${usersWithoutClients.length}`);
      console.log(`📊 Client records without users: ${clientsWithoutUsers.length}`);
      
      if (usersWithoutClients.length > 0) {
        console.log('⚠️ Users without client records:');
        usersWithoutClients.slice(0, 3).forEach(id => {
          const user = authUsers.users.find(u => u.id === id);
          console.log(`  - ${user?.email} (${id})`);
        });
      }
    }

    console.log('\n📋 DIAGNOSIS:');
    if (clients.length === 0) {
      console.log('❌ PROBLEM: No client records exist in the database');
      console.log('💡 SOLUTION: The profile update API is not creating client records');
      console.log('🔧 ACTION: Check the profile update API and ensure it creates client records');
    } else {
      console.log('✅ Client records exist');
    }

    if (authUsers.users.length === 0) {
      console.log('❌ PROBLEM: No users exist in auth.users');
      console.log('💡 SOLUTION: Users need to register first');
    } else {
      console.log('✅ Users exist in auth.users');
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testProfileUpdate(); 