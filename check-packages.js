require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Controllo tabella packages...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPackages() {
  try {
    console.log('🔍 Controllo esistenza tabella packages...');
    
    // Test se la tabella packages esiste
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Errore accesso tabella packages:', error.message);
      
      // Controlla se la tabella esiste
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.log('❌ La tabella packages NON ESISTE nel database!');
        console.log('💡 Devi eseguire lo script setup-production.sql per creare la tabella');
        return false;
      }
      return false;
    }
    
    console.log('✅ Tabella packages trovata!');
    console.log(`📊 Numero di pacchetti: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('📋 Pacchetti disponibili:');
      data.forEach((pkg, index) => {
        console.log(`  ${index + 1}. ${pkg.name} - €${pkg.min_investment} - ${pkg.expected_return}% - ${pkg.status}`);
      });
    } else {
      console.log('⚠️  Nessun pacchetto trovato nella tabella');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore durante il controllo:', error.message);
    return false;
  }
}

checkPackages().then(success => {
  process.exit(success ? 0 : 1);
}); 