require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Aggiunta colonna expected_return alla tabella packages...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration (serve service role key)');
  process.exit(1);
}

// Usa service role key per modifiche schema
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPackagesSchema() {
  try {
    console.log('🔍 Controllo struttura tabella packages...');
    
    // Prima controlla se la colonna esiste
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'packages' });
    
    if (columnsError) {
      console.log('⚠️  Non posso controllare le colonne, procedo con l\'aggiunta...');
    } else {
      console.log('📋 Colonne esistenti:', columns);
      if (columns?.some(col => col.column_name === 'expected_return')) {
        console.log('✅ La colonna expected_return esiste già!');
        return true;
      }
    }
    
    console.log('🔄 Aggiunta colonna expected_return...');
    
    // Aggiungi la colonna expected_return
    const { error: alterError } = await supabase
      .rpc('add_column_if_not_exists', {
        table_name: 'packages',
        column_name: 'expected_return',
        column_type: 'DECIMAL(5,2)',
        default_value: '1.0'
      });
    
    if (alterError) {
      console.error('❌ Errore aggiunta colonna:', alterError.message);
      
      // Prova con SQL diretto
      console.log('🔄 Tentativo con SQL diretto...');
      const { error: sqlError } = await supabase
        .rpc('exec_sql', {
          sql_query: 'ALTER TABLE packages ADD COLUMN IF NOT EXISTS expected_return DECIMAL(5,2) DEFAULT 1.0;'
        });
      
      if (sqlError) {
        console.error('❌ Errore anche con SQL diretto:', sqlError.message);
        return false;
      }
    }
    
    console.log('✅ Colonna expected_return aggiunta!');
    
    // Ora aggiorna i pacchetti con i valori corretti
    console.log('🔄 Aggiornamento valori expected_return...');
    
    const updates = [
      { name: 'Starter Package', expected_return: 8.5 },
      { name: 'Elite Package', expected_return: 12.0 },
      { name: 'Premium Package', expected_return: 15.5 }
    ];
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('packages')
        .update({ expected_return: update.expected_return })
        .eq('name', update.name);
      
      if (updateError) {
        console.error(`❌ Errore aggiornamento ${update.name}:`, updateError.message);
      } else {
        console.log(`✅ Aggiornato ${update.name}: ${update.expected_return}%`);
      }
    }
    
    // Verifica finale
    console.log('🔍 Verifica finale...');
    const { data: finalPackages, error: finalError } = await supabase
      .from('packages')
      .select('*')
      .order('min_investment', { ascending: true });
    
    if (finalError) {
      console.error('❌ Errore verifica finale:', finalError.message);
      return false;
    }
    
    console.log('✅ Schema e dati aggiornati con successo!');
    console.log('📋 Stato finale:');
    finalPackages?.forEach((pkg, index) => {
      console.log(`  ${index + 1}. ${pkg.name}`);
      console.log(`     Min: €${pkg.min_investment?.toLocaleString()}`);
      console.log(`     Max: €${pkg.max_investment?.toLocaleString()}`);
      console.log(`     Durata: ${pkg.duration} giorni`);
      console.log(`     Rendimento: ${pkg.expected_return}%`);
      console.log(`     Stato: ${pkg.status}`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore durante la correzione:', error.message);
    return false;
  }
}

fixPackagesSchema().then(success => {
  process.exit(success ? 0 : 1);
}); 