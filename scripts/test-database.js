const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  console.log('🔍 Testando connessione al database...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseServiceKey.substring(0, 20) + '...');
  console.log('');

  try {
    // Test 1: Verifica connessione base
    console.log('📡 Test 1: Connessione base...');
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Errore connessione:', testError.message);
      console.log('💡 Possibili cause:');
      console.log('   - Chiave API non valida');
      console.log('   - URL Supabase non corretto');
      console.log('   - Tabelle non esistenti');
      console.log('');
      return false;
    }
    
    console.log('✅ Connessione riuscita!');
    console.log('');

    // Test 2: Verifica tabelle
    console.log('📊 Test 2: Verifica tabelle...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.log('❌ Errore tabella clients:', clientsError.message);
    } else {
      console.log('✅ Tabella clients OK - Record trovati:', clients?.length || 0);
    }
    
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);
    
    if (packagesError) {
      console.log('❌ Errore tabella packages:', packagesError.message);
    } else {
      console.log('✅ Tabella packages OK - Record trovati:', packages?.length || 0);
    }
    
    console.log('');
    console.log('🎉 Database test completato!');
    console.log('');
    console.log('📋 RISULTATO:');
    if (clientsError || packagesError) {
      console.log('⚠️  Database parzialmente funzionante');
      console.log('💡 Usa i dati mock per testare il CRUD');
    } else {
      console.log('✅ Database completamente funzionante');
      console.log('💡 Il sistema userà i dati reali');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
    return false;
  }
}

// Esegui il test
testDatabaseConnection(); 