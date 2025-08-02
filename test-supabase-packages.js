const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key configured:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing basic connection...');
    
    // Test 1: Connessione di base
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Basic connection failed:', testError.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Verifica tabella packages
    console.log('🔄 Checking packages table...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (packagesError) {
      console.log('❌ Packages table error:', packagesError.message);
      return false;
    }
    
    console.log('✅ Packages table accessible');
    console.log('📊 Found packages:', packages?.length || 0);
    
    if (packages && packages.length > 0) {
      console.log('📋 Packages found:');
      packages.forEach((pkg, index) => {
        console.log(`  ${index + 1}. ${pkg.name} - €${pkg.min_investment}-${pkg.max_investment} - ${pkg.expected_return}%`);
      });
    } else {
      console.log('⚠️ No packages found in database');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

async function createTestPackages() {
  try {
    console.log('🔄 Creating test packages...');
    
    const testPackages = [
      {
        name: 'Pacchetto Real Estate',
        description: 'Investimenti immobiliari sicuri con rendimenti garantiti',
        min_investment: 10000,
        max_investment: 50000,
        duration_months: 18,
        expected_return: 10.5,
        status: 'active',
        type: 'conservative',
        risk_level: 'low'
      },
      {
        name: 'Pacchetto Tech Growth',
        description: 'Investimenti in startup tecnologiche ad alto potenziale',
        min_investment: 15000,
        max_investment: 75000,
        duration_months: 24,
        expected_return: 18.0,
        status: 'active',
        type: 'aggressive',
        risk_level: 'high'
      },
      {
        name: 'Pacchetto Green Energy',
        description: 'Investimenti in energie rinnovabili e sostenibilità',
        min_investment: 8000,
        max_investment: 40000,
        duration_months: 30,
        expected_return: 12.5,
        status: 'active',
        type: 'balanced',
        risk_level: 'medium'
      }
    ];
    
    for (const pkg of testPackages) {
      const { data, error } = await supabase
        .from('packages')
        .insert([pkg])
        .select();
      
      if (error) {
        console.log(`❌ Error creating package "${pkg.name}":`, error.message);
      } else {
        console.log(`✅ Created package: ${pkg.name}`);
      }
    }
    
    console.log('✅ Test packages creation completed');
  } catch (error) {
    console.error('❌ Error creating test packages:', error);
  }
}

async function main() {
  console.log('🚀 Starting Supabase packages test...\n');
  
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('\n✅ Supabase connection successful!');
    
    // Opzionale: crea pacchetti di test se non ce ne sono
    const { data: existingPackages } = await supabase
      .from('packages')
      .select('count');
    
    if (!existingPackages || existingPackages.length === 0) {
      console.log('\n🔄 No packages found, creating test packages...');
      await createTestPackages();
    }
  } else {
    console.log('\n❌ Supabase connection failed!');
    console.log('💡 Check your environment variables and Supabase configuration');
  }
  
  console.log('\n🏁 Test completed');
}

main().catch(console.error); 