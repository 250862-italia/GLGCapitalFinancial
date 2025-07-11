const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
  console.log('🚀 RESET COMPLETO DEL DATABASE GLG CAPITAL FINANCIAL');
  console.log('=' .repeat(60));
  console.log('⚠️  ATTENZIONE: Questo script eliminerà TUTTI i dati esistenti!');
  console.log('=' .repeat(60));
  console.log('');

  // Conferma utente
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise((resolve) => {
    rl.question('Sei sicuro di voler procedere? (scrivi "RESET" per confermare): ', resolve);
  });
  rl.close();

  if (answer !== 'RESET') {
    console.log('❌ Operazione annullata.');
    process.exit(0);
  }

  console.log('\n🧹 Iniziando reset completo...\n');

  try {
    // FASE 1: PULIZIA DATABASE
    console.log('📋 FASE 1: PULIZIA DATABASE');
    console.log('-'.repeat(30));

    const tables = [
      'audit_trail', 'kyc_records', 'investments', 'payments', 
      'informational_requests', 'partnerships', 'content', 
      'notifications', 'backups', 'settings', 'team_members', 'clients'
    ];

    for (const table of tables) {
      console.log(`Eliminazione ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        console.log(`⚠️  Errore ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} pulito`);
      }
    }

    // Elimina utenti admin (mantieni solo superadmin)
    console.log('Eliminazione utenti admin...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .not('role', 'eq', 'superadmin');
    
    if (usersError) {
      console.log('⚠️  Errore utenti:', usersError.message);
    } else {
      console.log('✅ Utenti admin puliti');
    }

    // FASE 2: PULIZIA AUTH
    console.log('\n📋 FASE 2: PULIZIA AUTH');
    console.log('-'.repeat(30));

    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    if (authUsersError) {
      console.log('⚠️  Errore lista utenti auth:', authUsersError.message);
    } else {
      for (const user of authUsers.users) {
        // Mantieni solo gli utenti admin
        if (!user.email?.includes('@glgcapital.com') && !user.email?.includes('@magnificusdominus.com')) {
          console.log(`Eliminazione utente: ${user.email}`);
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.log(`⚠️  Errore eliminazione ${user.email}:`, deleteError.message);
          } else {
            console.log(`✅ Eliminato: ${user.email}`);
          }
        }
      }
    }

    // FASE 3: PULIZIA STORAGE
    console.log('\n📋 FASE 3: PULIZIA STORAGE');
    console.log('-'.repeat(30));

    const { data: buckets } = await supabase.storage.listBuckets();
    for (const bucket of buckets) {
      if (bucket.name !== 'avatars') { // Mantieni bucket avatars
        console.log(`Pulizia bucket: ${bucket.name}`);
        const { data: files } = await supabase.storage.from(bucket.name).list();
        for (const file of files) {
          const { error: deleteError } = await supabase.storage.from(bucket.name).remove([file.name]);
          if (deleteError) {
            console.log(`⚠️  Errore eliminazione file ${file.name}:`, deleteError.message);
          }
        }
        console.log(`✅ Bucket ${bucket.name} pulito`);
      }
    }

    // FASE 4: CREAZIONE SUPER ADMIN
    console.log('\n📋 FASE 4: CREAZIONE SUPER ADMIN');
    console.log('-'.repeat(30));

    const superAdminEmail = 'admin@glgcapital.com';
    const superAdminPassword = 'GLGAdmin2024!';
    const superAdminName = 'GLG Capital Admin';

    // Crea l'utente auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true,
      user_metadata: {
        name: superAdminName,
        role: 'superadmin'
      }
    });

    if (authError) {
      console.error('❌ Errore creazione utente auth:', authError.message);
    } else {
      console.log('✅ Utente auth creato:', authUser.user.email);

      // Crea record nella tabella users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: superAdminEmail,
          name: superAdminName,
          role: 'superadmin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        console.error('❌ Errore creazione record user:', userError.message);
      } else {
        console.log('✅ Record user creato');
      }

      // Crea record nella tabella clients (per compatibilità)
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          id: authUser.user.id,
          user_id: authUser.user.id,
          email: superAdminEmail,
          first_name: 'GLG',
          last_name: 'Admin',
          status: 'active',
          kyc_status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (clientError) {
        console.error('❌ Errore creazione record client:', clientError.message);
      } else {
        console.log('✅ Record client creato');
      }
    }

    // FASE 5: VERIFICA FINALE
    console.log('\n📋 FASE 5: VERIFICA FINALE');
    console.log('-'.repeat(30));

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Errore verifica - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} record`);
      }
    }

    console.log('\n🎉 RESET COMPLETATO CON SUCCESSO!');
    console.log('=' .repeat(60));
    console.log('📧 Super Admin Email:', superAdminEmail);
    console.log('🔑 Super Admin Password:', superAdminPassword);
    console.log('👤 Super Admin Name:', superAdminName);
    console.log('🔐 Role: superadmin');
    console.log('=' .repeat(60));
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo accesso!');
    console.log('🌐 URL Admin: https://glg-dashboard.vercel.app/admin/login');

  } catch (error) {
    console.error('❌ Errore durante il reset:', error);
    process.exit(1);
  }
}

// Esegui il reset
resetDatabase(); 