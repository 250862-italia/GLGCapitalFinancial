// Script per creare un utente centralizzato in Supabase Auth e nella tabella custom 'users'
// Requisiti: npm install @supabase/supabase-js dotenv

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Parametri utente (modifica qui per creare altri utenti)
const email = 'info@washtw.com';
const password = 'Nncgnn62*';
const role = 'superadmin';
const first_name = 'gianni';
const last_name = 'innocenti';

async function createUserCentralized() {
  // 1. Crea utente in Supabase Auth già confermato
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, first_name, last_name }
  });
  if (authError) {
    console.error('❌ Errore creazione utente Auth:', authError.message);
    return;
  }
  const userId = authData.user.id;
  console.log('✅ Utente Auth creato:', email, 'ID:', userId);

  // 2. Inserisci nella tabella custom 'users' (centralizzato)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      first_name,
      last_name,
      role,
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  if (userError) {
    console.error('❌ Errore inserimento in tabella users:', userError.message);
  } else {
    console.log('✅ Utente inserito nella tabella users con ruolo centralizzato:', role);
  }
}

createUserCentralized(); 