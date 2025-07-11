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

async function cleanupDatabase() {
  console.log('🧹 Iniziando pulizia completa del database...\n');

  try {
    // 1. Elimina audit trail
    console.log('1. Eliminazione audit trail...');
    const { error: auditError } = await supabase
      .from('audit_trail')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Mantieni almeno un record per evitare errori
    if (auditError) console.log('⚠️  Errore audit trail:', auditError.message);
    else console.log('✅ Audit trail pulito');

    // 2. Elimina KYC records
    console.log('2. Eliminazione KYC records...');
    const { error: kycError } = await supabase
      .from('kyc_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (kycError) console.log('⚠️  Errore KYC records:', kycError.message);
    else console.log('✅ KYC records puliti');

    // 3. Elimina investimenti
    console.log('3. Eliminazione investimenti...');
    const { error: investmentsError } = await supabase
      .from('investments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (investmentsError) console.log('⚠️  Errore investimenti:', investmentsError.message);
    else console.log('✅ Investimenti puliti');

    // 4. Elimina pagamenti
    console.log('4. Eliminazione pagamenti...');
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (paymentsError) console.log('⚠️  Errore pagamenti:', paymentsError.message);
    else console.log('✅ Pagamenti puliti');

    // 5. Elimina richieste informative
    console.log('5. Eliminazione richieste informative...');
    const { error: requestsError } = await supabase
      .from('informational_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (requestsError) console.log('⚠️  Errore richieste:', requestsError.message);
    else console.log('✅ Richieste informative pulite');

    // 6. Elimina partnership
    console.log('6. Eliminazione partnership...');
    const { error: partnershipsError } = await supabase
      .from('partnerships')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (partnershipsError) console.log('⚠️  Errore partnership:', partnershipsError.message);
    else console.log('✅ Partnership pulite');

    // 7. Elimina contenuti
    console.log('7. Eliminazione contenuti...');
    const { error: contentError } = await supabase
      .from('content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (contentError) console.log('⚠️  Errore contenuti:', contentError.message);
    else console.log('✅ Contenuti puliti');

    // 8. Elimina notifiche
    console.log('8. Eliminazione notifiche...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (notificationsError) console.log('⚠️  Errore notifiche:', notificationsError.message);
    else console.log('✅ Notifiche pulite');

    // 9. Elimina backup
    console.log('9. Eliminazione backup...');
    const { error: backupsError } = await supabase
      .from('backups')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (backupsError) console.log('⚠️  Errore backup:', backupsError.message);
    else console.log('✅ Backup puliti');

    // 10. Elimina impostazioni
    console.log('10. Eliminazione impostazioni...');
    const { error: settingsError } = await supabase
      .from('settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (settingsError) console.log('⚠️  Errore impostazioni:', settingsError.message);
    else console.log('✅ Impostazioni pulite');

    // 11. Elimina team
    console.log('11. Eliminazione team...');
    const { error: teamError } = await supabase
      .from('team_members')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (teamError) console.log('⚠️  Errore team:', teamError.message);
    else console.log('✅ Team pulito');

    // 12. Elimina clienti (mantieni solo la struttura)
    console.log('12. Eliminazione clienti...');
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (clientsError) console.log('⚠️  Errore clienti:', clientsError.message);
    else console.log('✅ Clienti puliti');

    // 13. Elimina utenti admin (mantieni solo superadmin)
    console.log('13. Eliminazione utenti admin...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .not('role', 'eq', 'superadmin');
    if (usersError) console.log('⚠️  Errore utenti:', usersError.message);
    else console.log('✅ Utenti admin puliti');

    // 14. Elimina utenti auth (mantieni solo admin)
    console.log('14. Eliminazione utenti auth...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    if (authUsersError) {
      console.log('⚠️  Errore lista utenti auth:', authUsersError.message);
    } else {
      for (const user of authUsers.users) {
        // Mantieni solo gli utenti admin
        if (!user.email?.includes('@glgcapital.com') && !user.email?.includes('@magnificusdominus.com')) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.log(`⚠️  Errore eliminazione utente ${user.email}:`, deleteError.message);
          } else {
            console.log(`✅ Eliminato utente: ${user.email}`);
          }
        }
      }
    }

    // 15. Pulisci storage
    console.log('15. Pulizia storage...');
    const { data: buckets } = await supabase.storage.listBuckets();
    for (const bucket of buckets) {
      if (bucket.name !== 'avatars') { // Mantieni bucket avatars
        const { data: files } = await supabase.storage.from(bucket.name).list();
        for (const file of files) {
          const { error: deleteError } = await supabase.storage.from(bucket.name).remove([file.name]);
          if (deleteError) {
            console.log(`⚠️  Errore eliminazione file ${file.name}:`, deleteError.message);
          }
        }
        console.log(`✅ Storage ${bucket.name} pulito`);
      }
    }

    console.log('\n🎉 PULIZIA COMPLETATA CON SUCCESSO!');
    console.log('Il database è ora vergine e pronto per nuovi dati.');

    // Verifica finale
    console.log('\n📊 VERIFICA FINALE:');
    const tables = [
      'audit_trail', 'kyc_records', 'investments', 'payments', 
      'informational_requests', 'partnerships', 'content', 
      'notifications', 'backups', 'settings', 'team_members', 'clients'
    ];

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

  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    process.exit(1);
  }
}

// Esegui la pulizia
cleanupDatabase(); 