// Script per verificare la struttura della tabella users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructure() {
  console.log('🔍 Verifica struttura tabella users...\n');

  try {
    // 1. Verifica se la tabella esiste
    console.log('1. Verifica esistenza tabella users...');
    const { data: tableExists, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Errore accesso tabella users:', tableError.message);
      return;
    }
    console.log('✅ Tabella users esiste');

    // 2. Prova a inserire un record di test per vedere quali colonne sono richieste
    console.log('\n2. Test inserimento per verificare colonne...');
    const testRecord = {
      id: 'test-id-' + Date.now(),
      email: 'test@example.com',
      password_hash: 'test_hash',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('users')
      .insert(testRecord)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Errore inserimento test (normale per verificare struttura):', insertError.message);
      
      // Analizza l'errore per capire quali colonne mancano
      if (insertError.message.includes('email_confirmed')) {
        console.log('⚠️ Colonna email_confirmed mancante');
      }
      if (insertError.message.includes('email_verified')) {
        console.log('⚠️ Colonna email_verified mancante');
      }
    } else {
      console.log('✅ Inserimento test riuscito');
      
      // Elimina il record di test
      await supabase
        .from('users')
        .delete()
        .eq('id', testRecord.id);
    }

    // 3. Verifica struttura con query SQL
    console.log('\n3. Verifica struttura con query SQL...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });

    if (columnsError) {
      console.log('⚠️ Impossibile ottenere colonne tramite RPC, uso metodo alternativo...');
      
      // Prova a selezionare tutte le colonne per vedere la struttura
      const { data: sampleData, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Errore selezione dati:', sampleError.message);
      } else {
        console.log('✅ Struttura tabella (da dati esistenti):');
        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]);
          columns.forEach(col => console.log(`  - ${col}`));
        } else {
          console.log('  Tabella vuota, nessuna colonna visibile');
        }
      }
    } else {
      console.log('✅ Colonne tabella users:');
      columns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
    }

    // 4. Verifica se esistono colonne specifiche
    console.log('\n4. Verifica colonne specifiche...');
    const testColumns = [
      'id', 'email', 'password_hash', 'first_name', 'last_name', 
      'role', 'is_active', 'email_confirmed', 'email_verified',
      'created_at', 'updated_at'
    ];

    for (const column of testColumns) {
      try {
        const { data: testCol, error: colError } = await supabase
          .from('users')
          .select(column)
          .limit(1);

        if (colError) {
          console.log(`❌ Colonna ${column}: NON ESISTE`);
        } else {
          console.log(`✅ Colonna ${column}: ESISTE`);
        }
      } catch (error) {
        console.log(`❌ Colonna ${column}: NON ESISTE`);
      }
    }

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

checkTableStructure(); 