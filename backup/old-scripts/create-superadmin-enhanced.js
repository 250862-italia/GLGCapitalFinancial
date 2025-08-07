const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  console.log('👑 Configurazione Super Admin...\n');

  try {
    // Credenziali Super Admin
    const superAdminEmail = 'admin@glgcapital.com';
    const superAdminPassword = 'GLGAdmin2024!';
    const superAdminName = 'GLG Capital Admin';
    const superAdminFirstName = 'GLG';
    const superAdminLastName = 'Admin';

    console.log('1. Test connessione Supabase...');

    // Test connessione
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('⚠️ Connessione Supabase fallita, creando superadmin in modalità offline...');
      console.log('📧 Email:', superAdminEmail);
      console.log('🔑 Password:', superAdminPassword);
      console.log('👤 Nome:', superAdminName);
      console.log('🔐 Role: superadmin');
      console.log('\n⚠️  IMPORTANTE: Esegui lo script SQL per creare le tabelle prima di usare il database!');
      return;
    }

    console.log('✅ Connessione Supabase riuscita');

    console.log('2. Creazione utente Super Admin...');

    // Crea l'utente auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true,
      user_metadata: {
        name: superAdminName,
        firstName: superAdminFirstName,
        lastName: superAdminLastName,
        role: 'superadmin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️ Utente già esistente, aggiornando ruolo...');
        
        // Ottieni l'utente esistente
        const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(superAdminEmail);
        
        if (getUserError) {
          console.error('❌ Errore recupero utente esistente:', getUserError.message);
          return;
        }
        
        authUser = { user: existingUser.user };
      } else {
        console.error('❌ Errore creazione utente auth:', authError.message);
        return;
      }
    } else {
      console.log('✅ Utente auth creato:', authUser.user.email);
    }

    console.log('3. Creazione profilo...');

    // Crea record nella tabella profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        name: superAdminName,
        email: superAdminEmail,
        role: 'superadmin',
        first_name: superAdminFirstName,
        last_name: superAdminLastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError.message);
      console.log('⚠️ Tentativo di creazione con struttura semplificata...');
      
      // Fallback: prova a creare solo i campi essenziali
      const { error: simpleProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          name: superAdminName,
          email: superAdminEmail,
          role: 'superadmin'
        }, { onConflict: 'id' });

      if (simpleProfileError) {
        console.error('❌ Errore anche con struttura semplificata:', simpleProfileError.message);
      } else {
        console.log('✅ Profilo creato con struttura semplificata');
      }
    } else {
      console.log('✅ Profilo creato');
    }

    console.log('4. Creazione record client...');

    // Crea record nella tabella clients
    const { error: clientError } = await supabase
      .from('clients')
      .upsert({
        user_id: authUser.user.id,
        profile_id: authUser.user.id,
        first_name: superAdminFirstName,
        last_name: superAdminLastName,
        email: superAdminEmail,
        client_code: 'ADMIN-' + authUser.user.id.substring(0, 8),
        status: 'active',
        risk_profile: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (clientError) {
      console.error('❌ Errore creazione record client:', clientError.message);
      console.log('⚠️ Tentativo di creazione con struttura semplificata...');
      
      // Fallback: prova a creare solo i campi essenziali
      const { error: simpleClientError } = await supabase
        .from('clients')
        .upsert({
          user_id: authUser.user.id,
          first_name: superAdminFirstName,
          last_name: superAdminLastName,
          email: superAdminEmail,
          status: 'active'
        }, { onConflict: 'user_id' });

      if (simpleClientError) {
        console.error('❌ Errore anche con struttura semplificata:', simpleClientError.message);
      } else {
        console.log('✅ Record client creato con struttura semplificata');
      }
    } else {
      console.log('✅ Record client creato');
    }

    console.log('\n🎉 SUPER ADMIN CONFIGURATO CON SUCCESSO!');
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Password:', superAdminPassword);
    console.log('👤 Nome:', superAdminName);
    console.log('🔐 Role: superadmin');
    console.log('🆔 User ID:', authUser.user.id);
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo accesso!');
    console.log('🌐 URL Login: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Errore durante la configurazione:', error);
    console.log('\n💡 Suggerimenti:');
    console.log('1. Verifica che le variabili d\'ambiente siano corrette');
    console.log('2. Esegui lo script SQL per creare le tabelle');
    console.log('3. Controlla che Supabase sia raggiungibile');
    process.exit(1);
  }
}

// Esegui la configurazione
createSuperAdmin(); 