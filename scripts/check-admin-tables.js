const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Verifica tabelle admin...\n');

  const tables = [
    'packages',
    'investments', 
    'payments',
    'kyc_requests',
    'informational_requests',
    'clients'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} record`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n🔍 Verifica RLS policies...\n');

  // Test admin access
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);

    if (adminError) {
      console.log(`❌ Accesso admin packages: ${adminError.message}`);
    } else {
      console.log(`✅ Accesso admin packages: OK`);
    }
  } catch (err) {
    console.log(`❌ Accesso admin packages: ${err.message}`);
  }

  console.log('\n🎯 Test completato!');
}

checkTables().catch(console.error); 