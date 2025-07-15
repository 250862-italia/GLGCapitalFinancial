require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestUser() {
  console.log('🔍 Verifica utente di test...\n');

  const testEmail = 'test@glgcapital.com';

  try {
    // 1. Controlla se esiste in Supabase Auth
    console.log('1. Controllo in Supabase Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Errore nel controllare Supabase Auth:', authError);
      return;
    }

    const authUser = authUsers.users.find(user => user.email === testEmail);
    
    if (authUser) {
      console.log('✅ Utente trovato in Supabase Auth:');
      console.log('   ID:', authUser.id);
      console.log('   Email:', authUser.email);
      console.log('   Email confermata:', authUser.email_confirmed_at ? 'Sì' : 'No');
      console.log('   Creato il:', authUser.created_at);
    } else {
      console.log('❌ Utente NON trovato in Supabase Auth');
    }

    // 2. Controlla se esiste nella tabella users
    console.log('\n2. Controllo nella tabella users...');
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('❌ Errore nel controllare tabella users:', dbError);
      return;
    }

    if (dbUser) {
      console.log('✅ Utente trovato nella tabella users:');
      console.log('   ID:', dbUser.id);
      console.log('   Email:', dbUser.email);
      console.log('   Nome:', dbUser.first_name);
      console.log('   Cognome:', dbUser.last_name);
      console.log('   Email confermata:', dbUser.email_confirmed);
    } else {
      console.log('❌ Utente NON trovato nella tabella users');
    }

    // 3. Controlla se esiste nella tabella clients
    console.log('\n3. Controllo nella tabella clients...');
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', authUser?.id || dbUser?.id)
      .single();

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('❌ Errore nel controllare tabella clients:', clientError);
      return;
    }

    if (client) {
      console.log('✅ Profilo cliente trovato:');
      console.log('   User ID:', client.user_id);
      console.log('   Nome:', client.first_name);
      console.log('   Cognome:', client.last_name);
      console.log('   Paese:', client.country);
    } else {
      console.log('❌ Profilo cliente NON trovato');
    }

    // 4. Test di login
    console.log('\n4. Test di login...');
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: 'Test123!'
    });

    if (loginError) {
      console.log('❌ Login fallito:', loginError.message);
    } else {
      console.log('✅ Login riuscito!');
      console.log('   User ID:', loginData.user.id);
      console.log('   Session:', loginData.session ? 'Creata' : 'Non creata');
    }

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

checkTestUser(); 