require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Presente' : '❌ Mancante');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Presente' : '❌ Mancante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log('👤 Creazione utente di test...\n');

  try {
    // Credenziali utente di test
    const testEmail = 'test@glgcapital.com';
    const testPassword = 'Test123!';
    const testFirstName = 'Test';
    const testLastName = 'User';
    const testCountry = 'Italy';

    console.log('1. Creazione utente auth...');

    // Crea l'utente auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: testFirstName,
        last_name: testLastName,
        role: 'user'
      }
    });

    if (authError) {
      console.error('❌ Errore creazione utente auth:', authError.message);
      return;
    }

    console.log('✅ Utente auth creato:', authUser.user.email);

    // Hash della password per la tabella users
    const passwordHash = crypto.createHash('sha256').update(testPassword).digest('hex');

    // Prova a inserire con email_confirmed, se fallisce riprova senza
    let userInsertError = null;
    let userInserted = false;
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: testEmail,
          first_name: testFirstName,
          last_name: testLastName,
          role: 'user',
          password_hash: passwordHash,
          is_active: true,
          email_confirmed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (!userError) userInserted = true;
      userInsertError = userError;
    } catch (e) {
      userInsertError = e;
    }
    if (!userInserted) {
      // Riprova senza email_confirmed
      const { error: userError2 } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: testEmail,
          first_name: testFirstName,
          last_name: testLastName,
          role: 'user',
          password_hash: passwordHash,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (!userError2) {
        userInserted = true;
        userInsertError = null;
      } else {
        userInsertError = userError2;
      }
    }

    if (userInsertError) {
      console.error('❌ Errore creazione record user:', userInsertError.message || userInsertError);
    } else {
      console.log('✅ Record user creato');
    }

    // Crea profilo cliente solo se il record user è stato creato
    if (userInserted) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authUser.user.id,
          first_name: testFirstName,
          last_name: testLastName,
          country: testCountry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (clientError) {
        console.error('❌ Errore creazione profilo cliente:', clientError.message);
      } else {
        console.log('✅ Profilo cliente creato');
      }
    } else {
      console.error('❌ Profilo cliente NON creato perché il record user non esiste.');
    }

    console.log('\n🎉 UTENTE DI TEST CREATO CON SUCCESSO!');
    console.log('='.repeat(50));
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('👤 Nome:', testFirstName, testLastName);
    console.log('🌍 Paese:', testCountry);
    console.log('='.repeat(50));
    console.log('\nOra puoi fare login con queste credenziali!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

createTestUser(); 