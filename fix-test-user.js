require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixTestUser() {
  console.log('🔧 Aggiornamento utente di test...\n');

  const testEmail = 'test@glgcapital.com';

  try {
    // Aggiorna email_confirmed nella tabella users
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ email_confirmed: true })
      .eq('email', testEmail)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Errore nell\'aggiornamento:', updateError);
      return;
    }

    if (updatedUser) {
      console.log('✅ Utente aggiornato con successo:');
      console.log('   ID:', updatedUser.id);
      console.log('   Email:', updatedUser.email);
      console.log('   Email confermata:', updatedUser.email_confirmed);
      console.log('   Nome:', updatedUser.first_name);
      console.log('   Cognome:', updatedUser.last_name);
    } else {
      console.log('❌ Utente non trovato');
    }

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

fixTestUser(); 