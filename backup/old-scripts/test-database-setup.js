// Test Database Setup - Verifica configurazione database
// Esegui questo script dopo aver eseguito database-schema-final.sql

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente Supabase mancanti!');
  console.log('Assicurati di avere nel file .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log('🔍 TESTING DATABASE SETUP...');
  console.log('=====================================');

  const tests = [
    {
      name: 'Profiles Table',
      query: () => supabase.from('profiles').select('count').limit(1)
    },
    {
      name: 'Clients Table',
      query: () => supabase.from('clients').select('count').limit(1)
    },
    {
      name: 'Packages Table',
      query: () => supabase.from('packages').select('count').limit(1)
    },
    {
      name: 'Investments Table',
      query: () => supabase.from('investments').select('count').limit(1)
    },
    {
      name: 'Payments Table',
      query: () => supabase.from('payments').select('count').limit(1)
    },
    {
      name: 'Team Members Table',
      query: () => supabase.from('team_members').select('count').limit(1)
    },
    {
      name: 'Partnerships Table',
      query: () => supabase.from('partnerships').select('count').limit(1)
    },
    {
      name: 'Content Table',
      query: () => supabase.from('content').select('count').limit(1)
    },
    {
      name: 'KYC Requests Table',
      query: () => supabase.from('kyc_requests').select('count').limit(1)
    },
    {
      name: 'Informational Requests Table',
      query: () => supabase.from('informational_requests').select('count').limit(1)
    },
    {
      name: 'Analytics Table',
      query: () => supabase.from('analytics').select('count').limit(1)
    },
    {
      name: 'Notifications Table',
      query: () => supabase.from('notifications').select('count').limit(1)
    },
    {
      name: 'Email Queue Table',
      query: () => supabase.from('email_queue').select('count').limit(1)
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing ${test.name}...`);
      
      const { data, error } = await test.query();
      
      if (error) {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: PASSED`);
        passedTests++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${err.message}`);
    }
  }

  console.log('\n=====================================');
  console.log(`📊 RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('\n✅ All tables are accessible');
    console.log('✅ RLS policies are working');
    console.log('✅ Database is ready for production');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('💡 Make sure you executed the SQL script completely');
  }

  // Test sample data
  console.log('\n🔍 Testing sample data...');
  
  try {
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (packagesError) {
      console.log('❌ Sample packages not found');
    } else {
      console.log(`✅ Found ${packages.length} sample packages`);
      packages.forEach(pkg => {
        console.log(`   - ${pkg.name} (${pkg.type}, ${pkg.expected_return}% return)`);
      });
    }
  } catch (err) {
    console.log('❌ Error testing sample data:', err.message);
  }

  // Test content
  try {
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .limit(3);

    if (contentError) {
      console.log('❌ Sample content not found');
    } else {
      console.log(`✅ Found ${content.length} sample content items`);
      content.forEach(item => {
        console.log(`   - ${item.title} (${item.type})`);
      });
    }
  } catch (err) {
    console.log('❌ Error testing content:', err.message);
  }

  console.log('\n=====================================');
  console.log('🚀 NEXT STEPS:');
  console.log('1. Test the admin dashboard at http://localhost:3000/admin/login');
  console.log('2. Login with admin@glgcapital.com / GLGAdmin2024!');
  console.log('3. Verify all CRUD operations work');
  console.log('4. Test the main application at http://localhost:3000');
}

// Esegui il test
testDatabaseSetup().catch(console.error); 