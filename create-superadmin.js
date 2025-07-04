require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  try {
    console.log('🔐 Creazione Super Admin...');
    
    // Dati del superadmin
    const superAdminData = {
      email: 'admin@glgcapital.com',
      password: 'Admin123!@#', // Password sicura di default
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_active: true,
      email_verified: true
    };

    // Hash della password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(superAdminData.password, saltRounds);

    // Verifica se esiste già un superadmin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'super_admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Errore nel controllo superadmin esistente:', checkError);
      return;
    }

    if (existingAdmin) {
      console.log('⚠️  Super Admin già esistente:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Per cambiare la password, usa lo script update-password.js');
      return;
    }

    // Inserimento del superadmin
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: superAdminData.email,
        password_hash: passwordHash,
        first_name: superAdminData.first_name,
        last_name: superAdminData.last_name,
        role: superAdminData.role,
        is_active: superAdminData.is_active,
        email_verified: superAdminData.email_verified,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Errore nella creazione del superadmin:', error);
      return;
    }

    console.log('✅ Super Admin creato con successo!');
    console.log('📧 Credenziali di accesso:');
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log('');
    console.log('🔗 URL di accesso: http://localhost:3000/login');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo accesso!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Esegui lo script
createSuperAdmin(); 