const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurazione Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente Supabase mancanti');
  console.log('📋 Assicurati che il file .env.local contenga:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Credenziali admin
const ADMIN_EMAIL = 'admin@glgcapital.com';
const ADMIN_PASSWORD = 'GLGAdmin2024!';

async function createAdminUser() {
  console.log('🚀 Creazione utente Admin per GLG Capital Financial Dashboard');
  console.log('='.repeat(60));

  try {
    // 1. Verifica se l'utente admin esiste già
    console.log('\n📋 1. Verifica esistenza utente admin...');
    const { data: existingUsers, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Errore durante la verifica degli utenti:', userError.message);
      process.exit(1);
    }

    const adminUser = existingUsers?.users?.find(user => user.email === ADMIN_EMAIL);

    if (!adminUser) {
      console.log(`   Utente admin "${ADMIN_EMAIL}" non trovato. Creazione in corso...`);
      
      // 2. Crea utente admin
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: 'superadmin',
          first_name: 'Admin',
          last_name: 'GLG'
        }
      });

      if (createError) {
        console.error('❌ Errore durante la creazione dell\'utente admin:', createError.message);
        process.exit(1);
      }

      console.log(`✅ Utente admin "${ADMIN_EMAIL}" creato con successo. ID: ${newUser.user.id}`);
      
      // 3. Crea profilo admin
      console.log('\n📋 2. Creazione profilo admin...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: ADMIN_EMAIL,
          full_name: 'Admin GLG',
          role: 'superadmin',
          status: 'active',
          email_verified: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Errore durante la creazione del profilo admin:', profileError.message);
        // Non esci, il profilo potrebbe già esistere
      } else {
        console.log('✅ Profilo admin creato con successo');
      }

      // 4. Crea record cliente admin
      console.log('\n📋 3. Creazione record cliente admin...');
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: newUser.user.id,
          email: ADMIN_EMAIL,
          first_name: 'Admin',
          last_name: 'GLG',
          status: 'active'
        })
        .select()
        .single();

      if (clientError) {
        console.error('❌ Errore durante la creazione del record cliente admin:', clientError.message);
        // Non esci, il record potrebbe già esistere
      } else {
        console.log('✅ Record cliente admin creato con successo');
      }

    } else {
      console.log(`✅ Utente admin "${ADMIN_EMAIL}" già esistente. ID: ${adminUser.id}`);
      
      // Aggiorna i metadati se necessario
      if (adminUser.user_metadata?.role !== 'superadmin') {
        console.log('📋 Aggiornamento metadati utente admin...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          adminUser.id,
          {
            user_metadata: {
              role: 'superadmin',
              first_name: 'Admin',
              last_name: 'GLG'
            }
          }
        );

        if (updateError) {
          console.error('❌ Errore durante l\'aggiornamento dei metadati:', updateError.message);
        } else {
          console.log('✅ Metadati utente admin aggiornati');
        }
      }
    }

    // 5. Test login admin
    console.log('\n📋 4. Test login admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (loginError) {
      console.error('❌ Login admin fallito:', loginError.message);
      process.exit(1);
    } else {
      console.log('✅ Login admin riuscito');
      await supabase.auth.signOut(); // Logout after test
    }

    // 6. Verifica accesso alle tabelle admin
    console.log('\n📋 5. Verifica accesso tabelle admin...');
    
    // Test accesso a packages
    const { data: packages, error: packagesError } = await supabase.from('packages').select('count').limit(1);
    if (packagesError) {
      console.error('❌ Errore accesso tabella packages:', packagesError.message);
    } else {
      console.log('✅ Accesso tabella packages: OK');
    }

    // Test accesso a clients
    const { data: clients, error: clientsError } = await supabase.from('clients').select('count').limit(1);
    if (clientsError) {
      console.error('❌ Errore accesso tabella clients:', clientsError.message);
    } else {
      console.log('✅ Accesso tabella clients: OK');
    }

    // Test accesso a profiles
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('count').limit(1);
    if (profilesError) {
      console.error('❌ Errore accesso tabella profiles:', profilesError.message);
    } else {
      console.log('✅ Accesso tabella profiles: OK');
    }

    console.log('\n🎉 UTENTE ADMIN CREATO CON SUCCESSO!');
    console.log('='.repeat(60));
    console.log('📧 Email: admin@glgcapital.com');
    console.log('🔑 Password: GLGAdmin2024!');
    console.log('🌐 Login URL: http://localhost:3000/admin/login');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Errore generale:', error);
    process.exit(1);
  }
}

// Esegui lo script
createAdminUser(); 