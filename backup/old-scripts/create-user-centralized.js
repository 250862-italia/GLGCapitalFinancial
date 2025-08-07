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
  console.log('🔧 Inizializzazione creazione utente superadmin...');
  
  // 1. Crea utente in Supabase Auth già confermato
  let userId;
  let userAlreadyExists = false;
  
  console.log('📧 Tentativo creazione utente in Supabase Auth...');
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
      const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers();
      if (getUserError) {
        console.error('❌ Errore recupero utenti Auth:', getUserError.message);
        return;
      }
      
      const user = existingUsers.users.find(u => u.email === email);
      if (!user) {
        console.error('❌ Utente non trovato in Auth');
        return;
      }
      
      userId = user.id;
      userAlreadyExists = true;
      console.log('✅ Utente Auth trovato con ID:', userId);
    } else {
      console.error('❌ Errore creazione utente Auth:', authError.message);
      return;
    }
  } else {
    userId = authData.user.id;
    console.log('✅ Utente Auth creato:', email, 'ID:', userId);
  }

  // 2. Pulisci eventuali duplicati nella tabella users
  console.log('🧹 Pulizia duplicati nella tabella users...');
  const { data: allUsers, error: listError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);
    
  if (listError) {
    console.error('❌ Errore recupero utenti:', listError.message);
    return;
  }
  
  if (allUsers && allUsers.length > 1) {
    console.log(`⚠️ Trovati ${allUsers.length} utenti con email ${email}, rimuovo duplicati...`);
    
    // Mantieni solo il primo e aggiornalo
    const userToKeep = allUsers[0];
    const usersToDelete = allUsers.slice(1);
    
    for (const user of usersToDelete) {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
        
      if (deleteError) {
        console.error('❌ Errore eliminazione duplicato:', deleteError.message);
      } else {
        console.log('✅ Duplicato eliminato:', user.id);
      }
    }
    
    // Aggiorna l'utente rimanente
    const { error: updateError } = await supabase
      .from('users')
      .update({
        id: userId,
        role,
        is_active: true,
        email_verified: true,
        password_hash: 'supabase_auth_managed',
        updated_at: new Date().toISOString()
      })
      .eq('id', userToKeep.id);
      
    if (updateError) {
      console.error('❌ Errore aggiornamento utente:', updateError.message);
    } else {
      console.log('✅ Utente aggiornato con successo');
    }
  } else if (allUsers && allUsers.length === 1) {
    // Aggiorna l'utente esistente
    console.log('✅ Utente già esistente nella tabella users, aggiorno...');
    const { error: updateError } = await supabase
      .from('users')
      .update({
        id: userId,
        role,
        is_active: true,
        email_verified: true,
        password_hash: 'supabase_auth_managed',
        updated_at: new Date().toISOString()
      })
      .eq('id', allUsers[0].id);
      
    if (updateError) {
      console.error('❌ Errore aggiornamento utente:', updateError.message);
    } else {
      console.log('✅ Utente aggiornato con successo');
    }
  } else {
    // Inserisci nuovo utente nella tabella users
    console.log('➕ Inserimento nuovo utente nella tabella users...');
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
      console.log('✅ Utente inserito nella tabella users con ruolo:', role);
    }
  }
  
  console.log('🎉 Operazione completata!');
  console.log('📋 Credenziali di accesso:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Ruolo: ${role}`);
}

createUserCentralized(); 