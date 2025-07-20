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

async function testInvestmentPurchase() {
  console.log('🧪 Testing investment purchase system...\\n');

  try {
    // 1. Check if packages table exists and has data
    console.log('1. Checking packages table...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (packagesError) {
      console.log('❌ Packages table error:', packagesError.message);
      console.log('💡 Run quick-fix-investment-purchase.sql in Supabase SQL Editor');
      return;
    }

    console.log(`✅ Packages table has ${packages.length} packages`);
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: $${pkg.min_investment} - $${pkg.max_investment}`);
    });

    if (packages.length === 0) {
      console.log('⚠️ No packages found. Run quick-fix-investment-purchase.sql to create sample packages');
      return;
    }

    // 2. Check investments table structure
    console.log('\\n2. Checking investments table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'investments')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Error checking table structure:', columnsError.message);
    } else {
      console.log('✅ Investments table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
      });
    }

    // 3. Test investment insertion
    console.log('\\n3. Testing investment insertion...');
    const testPackage = packages[0];
    const testInvestment = {
      user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f', // Test user ID
      package_id: testPackage.id,
      amount: 1000,
      payment_method: 'bank_transfer',
      status: 'pending',
      expected_return: 1.8,
      notes: 'Test investment for purchase system',
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
      
      if (insertError.message.includes('expected_return')) {
        console.log('\\n🔧 Solution: Run quick-fix-investment-purchase.sql to fix expected_return constraint');
      }
      if (insertError.message.includes('status')) {
        console.log('\\n🔧 Solution: Run quick-fix-investment-purchase.sql to fix status constraint');
      }
      if (insertError.message.includes('foreign key')) {
        console.log('\\n🔧 Solution: Ensure user_id and package_id exist in their respective tables');
      }
    } else {
      console.log('✅ Investment insertion successful!');
      console.log(`   Investment ID: ${newInvestment.id}`);
      console.log(`   Amount: $${newInvestment.amount}`);
      console.log(`   Status: ${newInvestment.status}`);
      console.log(`   Expected Return: ${newInvestment.expected_return}%`);
      
      // Clean up test investment
      await supabase
        .from('investments')
        .delete()
        .eq('id', newInvestment.id);
      console.log('🧹 Test investment cleaned up');
    }

    // 4. Check RLS policies
    console.log('\\n4. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, table_name')
      .eq('table_name', 'investments')
      .eq('table_schema', 'public');

    if (policiesError) {
      console.log('❌ Error checking RLS policies:', policiesError.message);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies for investments table`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policy_name}`);
      });
    }

    // 5. Final status
    console.log('\\n🎉 Investment purchase system test completed!');
    if (insertError) {
      console.log('❌ Issues found. Please run quick-fix-investment-purchase.sql in Supabase SQL Editor');
    } else {
      console.log('✅ All tests passed! Investment purchase system is working correctly.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testInvestmentPurchase(); 