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

async function addEmailConfirmedColumn() {
  console.log('🔧 Aggiunta colonna email_confirmed alla tabella users...\n');

  try {
    // Esegui la query SQL per aggiungere la colonna
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true;'
    });

    if (error) {
      console.error('❌ Errore nell\'esecuzione della query:', error);
      
      // Prova con una query più semplice
      console.log('🔄 Provo con una query alternativa...');
      const { data: alterData, error: alterError } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1);
      
      if (alterError) {
        console.error('❌ Errore nel test della tabella:', alterError);
        console.log('💡 Devi eseguire manualmente questa query nel Supabase SQL Editor:');
        console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true;');
        return;
      }
      
      console.log('✅ La tabella users esiste, ma la colonna email_confirmed deve essere aggiunta manualmente');
      console.log('💡 Esegui questa query nel Supabase SQL Editor:');
      console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true;');
      return;
    }

    console.log('✅ Colonna email_confirmed aggiunta con successo!');

    // Ora aggiorna l'utente di test
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ email_confirmed: true })
      .eq('email', 'test@glgcapital.com')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Errore nell\'aggiornamento utente:', updateError);
    } else if (updatedUser) {
      console.log('✅ Utente di test aggiornato:');
      console.log('   Email confermata:', updatedUser.email_confirmed);
    }

  } catch (error) {
    console.error('❌ Errore generale:', error);
    console.log('💡 Devi eseguire manualmente questa query nel Supabase SQL Editor:');
    console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true;');
  }
}

addEmailConfirmedColumn(); 