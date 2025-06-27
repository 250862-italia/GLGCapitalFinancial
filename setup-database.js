require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🗄️  Setup del database...');
    
    // Leggi il file schema SQL
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Esecuzione schema SQL...');
    
    // Esegui le query SQL
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('❌ Errore nell\'esecuzione dello schema:', error);
      console.log('');
      console.log('💡 Soluzione alternativa:');
      console.log('1. Vai su Supabase Dashboard');
      console.log('2. Apri SQL Editor');
      console.log('3. Copia e incolla il contenuto di database-schema.sql');
      console.log('4. Esegui le query');
      return;
    }
    
    console.log('✅ Database configurato con successo!');
    console.log('');
    console.log('🔐 Prossimi passi:');
    console.log('1. Esegui: node create-superadmin.js');
    console.log('2. Testa il login su: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
    console.log('');
    console.log('💡 Soluzione alternativa:');
    console.log('1. Vai su Supabase Dashboard');
    console.log('2. Apri SQL Editor');
    console.log('3. Copia e incolla il contenuto di database-schema.sql');
    console.log('4. Esegui le query');
  }
}

// Esegui lo script
setupDatabase(); 