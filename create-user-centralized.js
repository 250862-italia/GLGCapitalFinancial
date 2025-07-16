// Script per creare un utente centralizzato in Supabase Auth e nella tabella custom 'users'
// Requisiti: npm install @supabase/supabase-js dotenv

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Parametri utente (modifica qui per creare altri utenti)
const email = 'superadmin1@glgcapitalgroupllc.com';
const password = 'SuperAdmin2024!';
const role = 'superadmin';
const first_name = 'Super';
const last_name = 'Admin1';

async function createUserCentralized() {
  // 1. Crea utente in Supabase Auth già confermato
  let userId;
  let userAlreadyExists = false;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, first_name, last_name }
  });
  if (authError) {
    if (authError.message && authError.message.includes('already been registered')) {
      console.warn('⚠️ Utente già esistente in Auth, recupero ID...');
      // Recupera l'utente Auth esistente
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.listUsers({ email });
      if (getUserError || !existingUser || !existingUser.users || existingUser.users.length === 0) {
        console.error('❌ Impossibile recuperare utente Auth:', getUserError?.message || 'Non trovato');
        return;
      }
      userId = existingUser.users[0].id;
      userAlreadyExists = true;
    } else {
      console.error('❌ Errore creazione utente Auth:', authError.message);
      return;
    }
  } else {
    userId = authData.user.id;
    console.log('✅ Utente Auth creato:', email, 'ID:', userId);
  }

  // 2. Verifica se esiste già nella tabella users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (checkError && !checkError.message.includes('No rows found')) {
    console.error('❌ Errore verifica utente esistente:', checkError.message);
    return;
  }

  if (existingUser) {
    console.log('✅ Utente già esistente nella tabella users, aggiorno ruolo se necessario...');
    
    // Aggiorna solo se il ruolo è diverso
    if (existingUser.role !== role) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Errore aggiornamento ruolo:', updateError.message);
      } else {
        console.log('✅ Ruolo aggiornato a:', role);
      }
    } else {
      console.log('✅ Ruolo già corretto:', role);
    }
  } else {
    // Inserisci nuovo utente nella tabella users
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
        password_hash: 'supabase_auth_managed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error('❌ Errore inserimento in tabella users:', userError.message);
    } else {
      if (userAlreadyExists) {
        console.log('✅ Utente già esistente in Auth, inserito ora nella tabella users:', email);
      } else {
        console.log('✅ Utente inserito nella tabella users con ruolo centralizzato:', role);
      }
    }
  }
}

createUserCentralized(); 