require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function completeTestUser() {
  console.log('🔧 Completamento configurazione utente di test...\n');

  try {
    const testEmail = 'test@glgcapital.com';
    const testPassword = 'Test123!';
    const testFirstName = 'Test';
    const testLastName = 'User';
    const testCountry = 'Italy';

    console.log('1. Recupero utente auth esistente...');

    // Recupera l'utente auth esistente
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Errore recupero utenti auth:', authError.message);
      return;
    }

    const authUser = authUsers.users.find(user => user.email === testEmail);
    
    if (!authUser) {
      console.error('❌ Utente auth non trovato:', testEmail);
      return;
    }

    console.log('✅ Utente auth trovato:', authUser.email);

    // Hash della password per la tabella users
    const passwordHash = crypto.createHash('sha256').update(testPassword).digest('hex');

    console.log('2. Creazione record nella tabella users...');

    // Prova a inserire con email_confirmed, se fallisce riprova senza
    let userInsertError = null;
    let userInserted = false;
    
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
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
          id: authUser.id,
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

    console.log('3. Creazione profilo cliente...');

    // Crea profilo cliente solo se il record user è stato creato
    if (userInserted) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authUser.id,
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

    console.log('\n🎉 CONFIGURAZIONE UTENTE COMPLETATA!');
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

completeTestUser(); 