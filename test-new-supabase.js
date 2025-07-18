#!/usr/bin/env node

/**
 * Test script for new Supabase project connection
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Test Connessione Nuovo Progetto Supabase');
console.log('==========================================');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Verifica variabili d\'ambiente:');
console.log(`URL: ${supabaseUrl ? '✅ Presente' : '❌ Mancante'}`);
console.log(`Anon Key: ${supabaseKey ? '✅ Presente' : '❌ Mancante'}`);
console.log(`Service Key: ${serviceKey ? '✅ Presente' : '❌ Mancante'}`);

if (!supabaseUrl || !supabaseKey || !serviceKey) {
  console.log('\n❌ Variabili d\'ambiente mancanti!');
  console.log('📝 Assicurati di aver configurato .env.local con le nuove credenziali Supabase');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testando connessione...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('notes').select('count').limit(1);
    
    if (error) {
      console.log('❌ Errore connessione:', error.message);
      return false;
    }
    
    console.log('✅ Connessione base riuscita');
    
    // Test 2: Test notes table
    console.log('\n📝 Testando tabella notes...');
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(5);
    
    if (notesError) {
      console.log('❌ Errore tabella notes:', notesError.message);
      return false;
    }
    
    console.log(`✅ Tabella notes funzionante - ${notes.length} note trovate`);
    
    // Test 3: Test insert
    console.log('\n➕ Testando inserimento...');
    const testNote = {
      title: `Test note - ${new Date().toISOString()}`
    };
    
    const { data: newNote, error: insertError } = await supabase
      .from('notes')
      .insert([testNote])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Errore inserimento:', insertError.message);
      return false;
    }
    
    console.log('✅ Inserimento riuscito:', newNote.title);
    
    // Test 4: Test delete (cleanup)
    console.log('\n🗑️ Pulizia test...');
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', newNote.id);
    
    if (deleteError) {
      console.log('⚠️ Errore pulizia:', deleteError.message);
    } else {
      console.log('✅ Pulizia completata');
    }
    
    // Test 5: Test auth
    console.log('\n🔐 Testando autenticazione...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️ Errore auth (normale se non loggato):', authError.message);
    } else {
      console.log('✅ Sistema auth funzionante');
    }
    
    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('✅ Il nuovo progetto Supabase è configurato correttamente');
    console.log('🚀 Puoi ora utilizzare l\'applicazione con il database reale');
    
    return true;
    
  } catch (error) {
    console.log('❌ Errore generale:', error.message);
    return false;
  }
}

// Run tests
testConnection().then(success => {
  if (success) {
    console.log('\n📋 Prossimi passi:');
    console.log('1. ✅ Database configurato');
    console.log('2. 🧪 Test superati');
    console.log('3. 🚀 Deploy: npm run build && npm run deploy');
    console.log('4. 🌐 Testa l\'applicazione online');
  } else {
    console.log('\n🔧 Risoluzione problemi:');
    console.log('1. Verifica le credenziali in .env.local');
    console.log('2. Assicurati che il progetto sia attivo su Supabase');
    console.log('3. Controlla che setup-database.sql sia stato eseguito');
    console.log('4. Verifica la connessione internet');
  }
}); 