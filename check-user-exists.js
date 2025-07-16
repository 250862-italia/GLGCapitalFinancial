// Script per verificare se l'utente superadmin esiste già
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const email = 'superadmin1@glgcapitalgroupllc.com';

async function checkUserExists() {
  console.log('🔍 Verifico se l\'utente esiste già...\n');

  try {
    // 1. Verifica in Auth
    console.log('1. Verifica in Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Errore lista utenti Auth:', authError.message);
      return;
    }

    const authUser = authUsers.users.find(user => user.email === email);
    if (authUser) {
      console.log('✅ Utente trovato in Auth:', authUser.email, 'ID:', authUser.id);
    } else {
      console.log('❌ Utente NON trovato in Auth');
    }

    // 2. Verifica nella tabella users
    console.log('\n2. Verifica nella tabella users...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (dbError) {
      if (dbError.message.includes('No rows found')) {
        console.log('❌ Utente NON trovato nella tabella users');
      } else {
        console.error('❌ Errore query tabella users:', dbError.message);
      }
    } else {
      console.log('✅ Utente trovato nella tabella users:', dbUser);
    }

    // 3. Se esiste in Auth ma non in users, lo creo
    if (authUser && !dbUser) {
      console.log('\n3. Creazione record nella tabella users...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          first_name: 'Super',
          last_name: 'Admin1',
          role: 'superadmin',
          is_active: true,
          email_verified: true,
          password_hash: 'supabase_auth_managed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Errore inserimento:', insertError.message);
      } else {
        console.log('✅ Record creato nella tabella users');
      }
    }

    // 4. Se esiste in entrambi, aggiorno il ruolo se necessario
    if (authUser && dbUser) {
      console.log('\n4. Verifica ruolo utente...');
      if (dbUser.role !== 'superadmin') {
        console.log('Aggiornamento ruolo a superadmin...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'superadmin',
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id);

        if (updateError) {
          console.error('❌ Errore aggiornamento ruolo:', updateError.message);
        } else {
          console.log('✅ Ruolo aggiornato a superadmin');
        }
      } else {
        console.log('✅ Ruolo già corretto (superadmin)');
      }
    }

    console.log('\n🎉 Verifica completata!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

checkUserExists(); 