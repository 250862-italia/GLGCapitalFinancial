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

async function fixInvestmentPurchase() {
  console.log('🔧 Fixing investment purchase issues...\n');

  try {
    // 1. Check if packages table exists and has data
    console.log('1. Checking packages table...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);

    if (packagesError) {
      console.log('⚠️ Packages table error:', packagesError.message);
      console.log('💡 You need to run the create-packages-table.sql script in Supabase SQL Editor');
    } else if (!packages || packages.length === 0) {
      console.log('⚠️ No packages found in database');
      console.log('💡 You need to run the create-packages-table.sql script in Supabase SQL Editor');
    } else {
      console.log('✅ Packages table exists with data');
    }

    // 2. Check investments table structure
    console.log('\n2. Checking investments table structure...');
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);

    if (investmentsError) {
      console.log('⚠️ Investments table error:', investmentsError.message);
      console.log('💡 You need to run the fix-investments-constraints.sql script in Supabase SQL Editor');
    } else {
      console.log('✅ Investments table exists');
    }

    // 3. Test creating a sample investment
    console.log('\n3. Testing investment creation...');
    const testInvestment = {
      user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f', // Test user ID
      package_id: '58d1948b-9453-4cfd-93e9-9b763750e478', // Test package ID
      amount: 1000,
      payment_method: 'bank_transfer',
      status: 'pending',
      expected_return: 1.8,
      notes: 'Test investment for fixing purchase issues',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newInvestment, error: insertError } = await supabase
      .from('investments')
      .insert(testInvestment)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Investment creation failed:', insertError.message);
      
      if (insertError.message.includes('constraint')) {
        console.log('\n🔧 Constraint issues detected. Please run these SQL scripts in Supabase SQL Editor:');
        console.log('1. fix-investments-constraints.sql');
        console.log('2. create-packages-table.sql');
      }
      
      if (insertError.message.includes('foreign key')) {
        console.log('\n🔧 Foreign key issues detected. Please ensure:');
        console.log('- The user ID exists in auth.users');
        console.log('- The package ID exists in packages table');
      }
    } else {
      console.log('✅ Investment creation test successful');
      
      // Clean up test investment
      await supabase
        .from('investments')
        .delete()
        .eq('id', newInvestment.id);
      console.log('🧹 Test investment cleaned up');
    }

    // 4. Check clients table
    console.log('\n4. Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f')
      .limit(1);

    if (clientsError) {
      console.log('⚠️ Clients table error:', clientsError.message);
    } else if (!clients || clients.length === 0) {
      console.log('⚠️ No client profile found for test user');
      console.log('💡 You need to create a client profile for the user');
    } else {
      console.log('✅ Client profile exists');
    }

    console.log('\n📋 Summary:');
    console.log('To fix investment purchase issues, please run these SQL scripts in Supabase SQL Editor:');
    console.log('1. fix-investments-constraints.sql - Fixes database constraints');
    console.log('2. create-packages-table.sql - Creates packages table with sample data');
    console.log('\nAfter running the scripts, test the investment purchase flow again.');

  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
}

// Run the fix
fixInvestmentPurchase().then(() => {
  console.log('\n✅ Fix process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fix process failed:', error);
  process.exit(1);
}); 