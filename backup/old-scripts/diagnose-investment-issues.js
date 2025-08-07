const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseInvestmentIssues() {
  console.log('🔍 Diagnosing investment purchase issues...\n');

  try {
    // 1. Check if investments table exists
    console.log('1. Checking investments table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'investments')
      .eq('table_schema', 'public');

    if (tableError) {
      console.log('❌ Error checking table structure:', tableError.message);
    } else {
      console.log('✅ Investments table columns:');
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 2. Check constraints
    console.log('\n2. Checking table constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'investments')
      .eq('table_schema', 'public');

    if (constraintError) {
      console.log('❌ Error checking constraints:', constraintError.message);
    } else {
      console.log('✅ Table constraints:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // 3. Check check constraints specifically
    console.log('\n3. Checking check constraints...');
    const { data: checkConstraints, error: checkError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('constraint_name', 'investments_status_check');

    if (checkError) {
      console.log('❌ Error checking check constraints:', checkError.message);
    } else if (checkConstraints.length > 0) {
      console.log('✅ Status check constraint:');
      checkConstraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.check_clause}`);
      });
    } else {
      console.log('⚠️ No status check constraint found');
    }

    // 4. Test investment insertion with current structure
    console.log('\n4. Testing investment insertion...');
    const testInvestment = {
      user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
      package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
      amount: 1000,
      status: 'pending',
      expected_return: 1.8,
      notes: 'Diagnostic test investment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newInvestment, error: insertError } = await supabase
      .from('investments')
      .insert(testInvestment)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Investment insertion failed:', insertError.message);
      console.log('   Error code:', insertError.code);
      console.log('   Error details:', insertError.details);
      
      // Provide specific solutions based on error
      if (insertError.message.includes('expected_return')) {
        console.log('\n🔧 Solution: Run fix-investments-constraints.sql to fix expected_return constraint');
      }
      if (insertError.message.includes('status')) {
        console.log('\n🔧 Solution: Run fix-investments-constraints.sql to fix status constraint');
      }
      if (insertError.message.includes('foreign key')) {
        console.log('\n🔧 Solution: Ensure user_id and package_id exist in their respective tables');
      }
    } else {
      console.log('✅ Investment insertion successful');
      
      // Clean up test investment
      await supabase
        .from('investments')
        .delete()
        .eq('id', newInvestment.id);
      console.log('🧹 Test investment cleaned up');
    }

    // 5. Check if packages table exists and has data
    console.log('\n5. Checking packages table...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (packagesError) {
      console.log('❌ Packages table error:', packagesError.message);
      console.log('\n🔧 Solution: Run create-packages-table-fixed.sql to create packages table');
    } else {
      console.log(`✅ Packages table has ${packages.length} packages`);
      packages.forEach(pkg => {
        console.log(`   - ${pkg.name}: $${pkg.min_investment} - $${pkg.max_investment}`);
      });
    }

    // 6. Check if clients table exists and has user data
    console.log('\n6. Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f')
      .limit(1);

    if (clientsError) {
      console.log('❌ Clients table error:', clientsError.message);
      console.log('\n🔧 Solution: Ensure clients table exists and user has a client profile');
    } else if (clients.length === 0) {
      console.log('⚠️ No client profile found for test user');
      console.log('\n🔧 Solution: Create client profile for user 3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f');
    } else {
      console.log('✅ Client profile found:', clients[0].first_name, clients[0].last_name);
    }

    console.log('\n📋 Summary of required actions:');
    console.log('1. Run fix-investments-constraints.sql in Supabase SQL Editor');
    console.log('2. Run create-packages-table-fixed.sql if packages table is missing');
    console.log('3. Ensure client profile exists for the user');
    console.log('4. Test investment purchase again');

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

// Run the diagnostic
diagnoseInvestmentIssues(); 