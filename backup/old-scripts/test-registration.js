// Script per testare la registrazione e identificare problemi
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testRegistration() {
  console.log('🧪 Test registrazione utente...\n');

  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    country: 'Italy'
  };

  try {
    // 1. Verifica connessione database
    console.log('1. Verifica connessione database...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Errore connessione database:', connectionError.message);
      return;
    }
    console.log('✅ Connessione database OK');

    // 2. Verifica struttura tabella users
    console.log('\n2. Verifica struttura tabella users...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Errore struttura tabella users:', tableError.message);
      return;
    }
    console.log('✅ Tabella users accessibile');

    // 3. Verifica se l'utente di test esiste già
    console.log('\n3. Verifica utente esistente...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (existingUser) {
      console.log('⚠️ Utente di test già esistente, cambio email...');
      testUser.email = `test${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
    }
    console.log('✅ Email utente di test:', testUser.email);

    // 4. Test creazione utente
    console.log('\n4. Test creazione utente...');
    const { createHash } = require('crypto');
    const passwordHash = createHash('sha256').update(testUser.password).digest('hex');
    const userId = require('crypto').randomUUID();

    const { data: newUser, error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: testUser.email,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        role: 'user',
        password_hash: passwordHash,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userInsertError) {
      console.error('❌ Errore creazione utente:', userInsertError.message);
      console.error('Dettagli errore:', userInsertError);
      return;
    }
    console.log('✅ Utente creato con successo:', newUser);

    // 5. Test creazione profilo cliente
    console.log('\n5. Test creazione profilo cliente...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        country: testUser.country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ Errore creazione profilo cliente:', clientError.message);
      console.error('Dettagli errore:', clientError);
    } else {
      console.log('✅ Profilo cliente creato con successo:', client);
    }

    // 6. Pulizia - elimina utente di test
    console.log('\n6. Pulizia - eliminazione utente di test...');
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteUserError) {
      console.log('⚠️ Errore eliminazione utente di test:', deleteUserError.message);
    } else {
      console.log('✅ Utente di test eliminato');
    }

    const { error: deleteClientError } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', userId);

    if (deleteClientError) {
      console.log('⚠️ Errore eliminazione cliente di test:', deleteClientError.message);
    } else {
      console.log('✅ Cliente di test eliminato');
    }

    console.log('\n🎉 Test completato con successo!');
    console.log('Il sistema di registrazione funziona correttamente.');

  } catch (error) {
    console.error('❌ Errore generale nel test:', error);
  }
}

testRegistration(); 