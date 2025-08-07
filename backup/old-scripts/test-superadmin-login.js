const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nel file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSuperAdminLogin() {
  console.log('🔐 Test Login Super Admin...\n');

  try {
    // Credenziali Super Admin
    const superAdminEmail = 'admin@glgcapital.com';
    const superAdminPassword = 'GLGAdmin2024!';

    console.log('1. Tentativo di login...');

    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: superAdminEmail,
      password: superAdminPassword
    });

    if (authError) {
      console.error('❌ Errore login:', authError.message);
      return;
    }

    console.log('✅ Login riuscito!');
    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);
    console.log('🔐 Session:', authData.session ? 'Attiva' : 'Non attiva');

    // Test accesso al profilo
    console.log('\n2. Test accesso al profilo...');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Errore accesso profilo:', profileError.message);
    } else {
      console.log('✅ Profilo accessibile');
      console.log('👤 Nome:', profileData.name);
      console.log('🔐 Ruolo:', profileData.role);
      console.log('📧 Email:', profileData.email);
    }

    // Test accesso ai dati client
    console.log('\n3. Test accesso ai dati client...');

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (clientError) {
      console.error('❌ Errore accesso client:', clientError.message);
    } else {
      console.log('✅ Dati client accessibili');
      console.log('👤 Nome:', clientData.first_name, clientData.last_name);
      console.log('📧 Email:', clientData.email);
      console.log('🔐 Status:', clientData.status);
    }

    // Test accesso admin (tutti i clienti)
    console.log('\n4. Test accesso admin (tutti i clienti)...');

    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (allClientsError) {
      console.error('❌ Errore accesso admin:', allClientsError.message);
    } else {
      console.log('✅ Accesso admin funzionante');
      console.log('📊 Numero clienti trovati:', allClients.length);
    }

    // Test accesso admin (tutti i profili)
    console.log('\n5. Test accesso admin (tutti i profili)...');

    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (allProfilesError) {
      console.error('❌ Errore accesso profili admin:', allProfilesError.message);
    } else {
      console.log('✅ Accesso profili admin funzionante');
      console.log('📊 Numero profili trovati:', allProfiles.length);
    }

    console.log('\n🎉 TEST SUPER ADMIN COMPLETATO CON SUCCESSO!');
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Password:', superAdminPassword);
    console.log('🌐 URL Login: http://localhost:3000/admin/login');
    console.log('🔐 Session Token:', authData.session?.access_token ? 'Presente' : 'Mancante');

    // Logout
    await supabase.auth.signOut();
    console.log('\n👋 Logout completato');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    console.log('\n💡 Suggerimenti:');
    console.log('1. Verifica che il superadmin sia stato creato correttamente');
    console.log('2. Controlla che le variabili d\'ambiente siano corrette');
    console.log('3. Esegui lo script SQL per aggiornare il database');
    process.exit(1);
  }
}

// Esegui il test
testSuperAdminLogin(); 