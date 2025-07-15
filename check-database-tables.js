require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Controllo tabelle database...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseTables() {
  try {
    console.log('🔍 Test accesso alle tabelle principali...');
    
    // Lista delle tabelle che dovrebbero esistere
    const expectedTables = [
      'clients',
      'packages', 
      'investments',
      'analytics',
      'email_queue',
      'partnerships',
      'team',
      'users',
      'payments',
      'notifications'
    ];
    
    console.log('📊 Tabelle attese:', expectedTables);
    console.log('\n🔍 Test accesso...\n');
    
    for (const tableName of expectedTables) {
      try {
        console.log(`🔍 Test tabella: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
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
    
    console.log('\n🔍 Test tabelle di sistema...');
    
    // Test tabelle di sistema Supabase
    const systemTables = ['profiles', 'auth.users'];
    
    for (const tableName of systemTables) {
      try {
        console.log(`🔍 Test tabella: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
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
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

checkDatabaseTables(); 