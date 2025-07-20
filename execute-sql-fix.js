const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQLFix() {
  try {
    console.log('🔧 Executing SQL fix for clients table...');

    // 1. Add missing columns one by one
    const columnsToAdd = [
      { name: 'company', type: 'TEXT' },
      { name: 'position', type: 'TEXT' },
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'nationality', type: 'TEXT' },
      { name: 'profile_photo', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'postal_code', type: 'TEXT' },
      { name: 'iban', type: 'TEXT' },
      { name: 'bic', type: 'TEXT' },
      { name: 'account_holder', type: 'TEXT' },
      { name: 'usdt_wallet', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      try {
        const { error } = await supabase
          .from('clients')
          .select(column.name)
          .limit(1);
        
        if (error && error.message.includes('column') && error.message.includes('does not exist')) {
          console.log(`⚠️ Column ${column.name} doesn't exist, adding...`);
          
          // We can't add columns directly via Supabase client, so we'll note this
          console.log(`📝 Need to add column ${column.name} ${column.type} manually in Supabase SQL Editor`);
        } else {
          console.log(`✅ Column ${column.name} exists`);
        }
      } catch (err) {
        console.log(`⚠️ Error checking column ${column.name}:`, err.message);
      }
    }

    // 2. Test current table structure
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Error testing table:', testError.message);
    } else {
      console.log('✅ Table is accessible');
      if (testData.length > 0) {
        console.log('📋 Current columns:', Object.keys(testData[0]));
      }
    }

    // 3. Check if there are any client records
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, user_id, first_name, last_name, email')
      .limit(10);

    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`📊 Found ${clients.length} client records`);
      
      if (clients.length > 0) {
        console.log('👥 Sample clients:');
        clients.forEach((client, index) => {
          console.log(`  ${index + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
        });
      }
    }

    // 4. Check if there are any users without client records
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(10);

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`👤 Found ${users.length} users`);
      
      if (users.length > 0) {
        console.log('👥 Sample users:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.id})`);
        });
      }
    }

    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the content of fix-clients-table-complete.sql');
    console.log('3. Execute the SQL script');
    console.log('4. This will add all missing columns to the clients table');
    console.log('5. After that, the admin panel should show all client data correctly');

  } catch (error) {
    console.error('❌ Error executing SQL fix:', error);
  }
}

executeSQLFix(); 