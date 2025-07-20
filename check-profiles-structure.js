const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfilesStructure() {
  try {
    console.log('🔍 Checking profiles table structure...');

    // Try to get a sample profile to see the structure
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing profiles table:', sampleError.message);
      return;
    }

    if (sampleProfile.length > 0) {
      console.log('✅ Profiles table is accessible');
      console.log('📋 Available columns:', Object.keys(sampleProfile[0]));
    } else {
      console.log('✅ Profiles table is accessible but empty');
      
      // Try to insert a minimal profile to see what columns are required
      const minimalProfile = {
        user_id: 'test-user-id',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      };

      const { data: testInsert, error: insertError } = await supabase
        .from('profiles')
        .insert(minimalProfile)
        .select();

      if (insertError) {
        console.log('❌ Error inserting minimal profile:', insertError.message);
      } else {
        console.log('✅ Minimal profile inserted successfully');
        console.log('📋 Available columns:', Object.keys(testInsert[0]));
        
        // Clean up test data
        await supabase
          .from('profiles')
          .delete()
          .eq('user_id', 'test-user-id');
      }
    }

    // Check if we can query the table structure directly
    console.log('\n🔍 Checking table schema...');
    
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: 'RPC not available' }));

    if (schemaError) {
      console.log('⚠️ Cannot query schema directly, using alternative method');
      
      // Try to get column info from information_schema
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');

      if (columnsError) {
        console.log('❌ Error querying column information:', columnsError.message);
      } else {
        console.log('📋 Profiles table columns:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
        });
      }
    } else {
      console.log('📋 Profiles table columns from RPC:');
      schemaInfo.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking profiles structure:', error);
  }
}

checkProfilesStructure(); 