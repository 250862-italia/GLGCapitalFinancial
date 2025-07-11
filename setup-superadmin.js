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

async function setupSuperAdmin() {
  console.log('👑 Configurazione Super Admin...\n');

  try {
    // Credenziali Super Admin
    const superAdminEmail = 'admin@glgcapital.com';
    const superAdminPassword = 'GLGAdmin2024!';
    const superAdminName = 'GLG Capital Admin';

    console.log('1. Creazione utente Super Admin...');

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
      return;
    }

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

    console.log('\n🎉 SUPER ADMIN CONFIGURATO CON SUCCESSO!');
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Password:', superAdminPassword);
    console.log('👤 Nome:', superAdminName);
    console.log('🔐 Role: superadmin');
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo accesso!');

  } catch (error) {
    console.error('❌ Errore durante la configurazione:', error);
    process.exit(1);
  }
}

// Esegui la configurazione
setupSuperAdmin(); 