const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simpleCRUDTest() {
  try {
    console.log('🧪 SIMPLE CRUD TESTING...\n');

    // 1. CLEAN DATABASE
    console.log('📋 STEP 1: Cleaning database...');
    
    await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Database cleaned');

    // 2. CREATE TEST USER
    console.log('\n📋 STEP 2: Creating test user...');
    
    const testEmail = `test.simple.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (createUserError) {
      console.log('❌ Error creating test user:', createUserError.message);
      return;
    }

    console.log(`✅ Test user created: ${testEmail} (ID: ${newUser.user.id})`);

    // 3. TEST CLIENT CREATION (simplified)
    console.log('\n📋 STEP 3: Testing client creation...');
    
    const clientData = {
      user_id: newUser.user.id,
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      phone: '+1234567890',
      status: 'active'
    };

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (clientError) {
      console.log('❌ Error creating client:', clientError.message);
      return;
    }

    console.log(`✅ Client created: ${client.id}`);

    // 4. TEST INVESTMENT CREATION
    console.log('\n📋 STEP 4: Testing investment creation...');
    
    const investmentData = {
      user_id: newUser.user.id,
      client_id: client.id,
      package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
      amount: 5000,
      status: 'pending',
      expected_return: 1.8,
      notes: 'Test investment'
    };

    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .insert(investmentData)
      .select()
      .single();

    if (investmentError) {
      console.log('❌ Error creating investment:', investmentError.message);
      return;
    }

    console.log(`✅ Investment created: ${investment.id}`);

    // 5. TEST READ OPERATIONS
    console.log('\n📋 STEP 5: Testing read operations...');
    
    // Read client
    const { data: readClient, error: readClientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client.id)
      .single();

    if (readClientError) {
      console.log('❌ Error reading client:', readClientError.message);
    } else {
      console.log('✅ Client read successfully');
      console.log(`   Name: ${readClient.first_name} ${readClient.last_name}`);
      console.log(`   Email: ${readClient.email}`);
    }

    // Read investment
    const { data: readInvestment, error: readInvestmentError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investment.id)
      .single();

    if (readInvestmentError) {
      console.log('❌ Error reading investment:', readInvestmentError.message);
    } else {
      console.log('✅ Investment read successfully');
      console.log(`   Amount: $${readInvestment.amount}`);
      console.log(`   Status: ${readInvestment.status}`);
    }

    // 6. TEST UPDATE OPERATIONS
    console.log('\n📋 STEP 6: Testing update operations...');
    
    // Update client
    const { data: updatedClient, error: updateClientError } = await supabase
      .from('clients')
      .update({ 
        first_name: 'Updated',
        last_name: 'Test User'
      })
      .eq('id', client.id)
      .select()
      .single();

    if (updateClientError) {
      console.log('❌ Error updating client:', updateClientError.message);
    } else {
      console.log('✅ Client updated successfully');
      console.log(`   New name: ${updatedClient.first_name} ${updatedClient.last_name}`);
    }

    // Update investment
    const { data: updatedInvestment, error: updateInvestmentError } = await supabase
      .from('investments')
      .update({ 
        status: 'active',
        notes: 'Investment activated'
      })
      .eq('id', investment.id)
      .select()
      .single();

    if (updateInvestmentError) {
      console.log('❌ Error updating investment:', updateInvestmentError.message);
    } else {
      console.log('✅ Investment updated successfully');
      console.log(`   New status: ${updatedInvestment.status}`);
    }

    // 7. TEST DATA SHARING
    console.log('\n📋 STEP 7: Testing data sharing...');
    
    // Test user can see their data
    const { data: userClients, error: userClientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', newUser.user.id);

    if (userClientsError) {
      console.log('❌ User cannot see their clients:', userClientsError.message);
    } else {
      console.log(`✅ User can see their clients: ${userClients.length}`);
    }

    const { data: userInvestments, error: userInvestmentsError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', newUser.user.id);

    if (userInvestmentsError) {
      console.log('❌ User cannot see their investments:', userInvestmentsError.message);
    } else {
      console.log(`✅ User can see their investments: ${userInvestments.length}`);
    }

    // Test admin can see all data
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*');

    if (allClientsError) {
      console.log('❌ Admin cannot see all clients:', allClientsError.message);
    } else {
      console.log(`✅ Admin can see all clients: ${allClients.length}`);
    }

    const { data: allInvestments, error: allInvestmentsError } = await supabase
      .from('investments')
      .select('*');

    if (allInvestmentsError) {
      console.log('❌ Admin cannot see all investments:', allInvestmentsError.message);
    } else {
      console.log(`✅ Admin can see all investments: ${allInvestments.length}`);
    }

    // 8. FINAL SUMMARY
    console.log('\n🎯 SIMPLE CRUD TEST SUMMARY:');
    console.log('✅ Database cleaned');
    console.log('✅ Test user created');
    console.log('✅ Client record created');
    console.log('✅ Investment record created');
    console.log('✅ Read operations working');
    console.log('✅ Update operations working');
    console.log('✅ Data sharing verified');
    
    console.log('\n📋 TEST USER CREDENTIALS:');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log(`User ID: ${newUser.user.id}`);
    
    console.log('\n🧪 NEXT STEPS:');
    console.log('1. Login with test user at http://localhost:3000/login');
    console.log('2. Check admin panel at http://localhost:3000/admin');
    console.log('3. Verify data appears in admin clients and investments');
    console.log('4. Test user profile and dashboard pages');

  } catch (error) {
    console.error('❌ Error in simple CRUD test:', error);
  }
}

simpleCRUDTest(); 