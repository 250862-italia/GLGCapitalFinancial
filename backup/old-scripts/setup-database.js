const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    console.log('🚀 Avvio setup database Supabase...');
    
    // Leggi il file SQL
    const sqlFile = path.join(__dirname, 'create-complete-database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 File SQL caricato, esecuzione script...');
    
    // Esegui lo script SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Errore durante l\'esecuzione dello script SQL:', error);
      
      // Se il metodo RPC non funziona, prova con query dirette
      console.log('🔄 Tentativo con query dirette...');
      
      // Dividi lo script in singole query
      const queries = sqlContent
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--'));
      
      for (const query of queries) {
        if (query.trim()) {
          try {
            const { error: queryError } = await supabase.rpc('exec_sql', { sql: query });
            if (queryError) {
              console.log(`⚠️ Query saltata: ${query.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log(`⚠️ Query saltata: ${query.substring(0, 50)}...`);
          }
        }
      }
    } else {
      console.log('✅ Script SQL eseguito con successo');
    }
    
    // Verifica le tabelle create
    console.log('🔍 Verifica tabelle create...');
    
    const tables = ['profiles', 'clients', 'analytics', 'team', 'notifications', 'investments', 'partnerships', 'payments'];
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Tabella ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Tabella ${table}: OK`);
        }
      } catch (e) {
        console.log(`❌ Tabella ${table}: Errore di connessione`);
      }
    }
    
    console.log('🎉 Setup database completato!');
    
  } catch (error) {
    console.error('💥 Errore durante il setup:', error);
  }
}

// Esegui il setup
setupDatabase(); 