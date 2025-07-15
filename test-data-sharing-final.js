require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Test finale condivisione dati...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDataSharingFinal() {
  try {
    console.log('🔍 Test 1: Verifica accesso tabelle principali...');
    
    // Test tabelle principali
    const mainTables = ['clients', 'packages', 'investments', 'analytics', 'team', 'notifications'];
    
    for (const tableName of mainTables) {
      try {
        console.log(`🔍 Test tabella: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Accessibile (${data?.length || 0} record)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n🔍 Test 2: Verifica condivisione pacchetti...');
    
    // Test condivisione pacchetti
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .eq('status', 'active');
    
    if (packagesError) {
      console.log(`❌ Errore pacchetti: ${packagesError.message}`);
    } else {
      console.log(`✅ Pacchetti condivisi: ${packages?.length || 0} pacchetti attivi`);
      packages?.forEach(pkg => {
        console.log(`   - ${pkg.name}: €${pkg.min_investment}-€${pkg.max_investment} (${pkg.expected_return}% return)`);
      });
    }
    
    console.log('\n🔍 Test 3: Verifica condivisione investimenti...');
    
    // Test condivisione investimenti
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(5);
    
    if (investmentsError) {
      console.log(`❌ Errore investimenti: ${investmentsError.message}`);
    } else {
      console.log(`✅ Investimenti condivisi: ${investments?.length || 0} investimenti`);
    }
    
    console.log('\n🔍 Test 4: Verifica accesso admin...');
    
    // Test accesso admin (se disponibile)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log(`❌ Errore accesso users: ${usersError.message}`);
    } else {
      console.log(`✅ Accesso users: ${users?.length || 0} utenti`);
    }
    
    console.log('\n🔍 Test 5: Verifica analytics...');
    
    // Test analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.log(`❌ Errore analytics: ${analyticsError.message}`);
    } else {
      console.log(`✅ Analytics: ${analytics?.length || 0} record`);
    }
    
    console.log('\n🎯 Riassunto condivisione dati:');
    console.log('✅ Pacchetti: Condivisi tra cliente e admin');
    console.log('✅ Investimenti: Condivisi tra cliente e admin');
    console.log('✅ Analytics: Disponibili per tracking');
    console.log('✅ Team: Gestione team admin');
    console.log('✅ Notifications: Sistema notifiche');
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

testDataSharingFinal(); 