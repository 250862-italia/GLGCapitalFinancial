// Script per creare un superadmin semplice
// Usa le credenziali di default di Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.log('Assicurati che .env.local contenga:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createSuperAdmin() {
  console.log('🔧 Creazione superadmin...');
  
  const email = 'admin@glgcapital.com';
  const password = 'Admin123!';
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'superadmin' }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  Superadmin già esistente:', email);
        console.log('🔑 Credenziali di accesso:');
        console.log('   Email:', email);
        console.log('   Password:', password);
      } else {
        console.error('❌ Errore creazione superadmin:', error.message);
      }
    } else {
      console.log('✅ Superadmin creato con successo!');
      console.log('🔑 Credenziali di accesso:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('   ID Utente:', data.user.id);
    }
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

createSuperAdmin(); 