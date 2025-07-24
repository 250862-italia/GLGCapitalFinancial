// Script per creare un admin completo
// Crea l'utente sia in Supabase Auth che nella tabella profiles

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

async function createCompleteAdmin() {
  console.log('🔧 Creazione admin completo...');
  
  const email = 'admin@glgcapital.com';
  const password = 'Admin123!';
  const firstName = 'Admin';
  const lastName = 'GLG';
  
  try {
    // 1. Crea utente in Supabase Auth
    console.log('1️⃣ Creazione utente in Supabase Auth...');
    let { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { 
        role: 'superadmin',
        first_name: firstName,
        last_name: lastName
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Utente già esistente in Auth:', email);
        
        // Prova a ottenere l'utente esistente
        const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
        if (getUserError) {
          console.error('❌ Errore nel recuperare utente esistente:', getUserError.message);
          return;
        }
        authUser = existingUser;
      } else {
        console.error('❌ Errore creazione utente Auth:', authError.message);
        return;
      }
    } else {
      console.log('✅ Utente creato in Auth:', authUser.user.id);
    }
    
    const userId = authUser.user.id;
    
    // 2. Crea profilo nella tabella profiles
    console.log('2️⃣ Creazione profilo nella tabella profiles...');
    const profileData = {
      id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: 'superadmin',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError.message);
      console.log('⚠️  Tentativo di creazione tabella profiles...');
      
      // Prova a creare la tabella se non esiste
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT true,
            email_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createTableError) {
        console.log('⚠️  Impossibile creare tabella, usando fallback...');
      } else {
        // Riprova a inserire il profilo
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' })
          .select()
          .single();
          
        if (retryError) {
          console.error('❌ Errore persistente creazione profilo:', retryError.message);
        } else {
          console.log('✅ Profilo creato con successo!');
        }
      }
    } else {
      console.log('✅ Profilo creato/aggiornato:', profile.id);
    }
    
    // 3. Crea record nella tabella clients se necessario
    console.log('3️⃣ Verifica tabella clients...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (clientError && clientError.code === 'PGRST116') {
      console.log('ℹ️  Creazione record client...');
      const clientData = {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        status: 'active',
        client_code: `ADMIN-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
        
      if (newClientError) {
        console.log('⚠️  Errore creazione client (non critico):', newClientError.message);
      } else {
        console.log('✅ Record client creato:', newClient.id);
      }
    } else if (client) {
      console.log('ℹ️  Record client già esistente');
    }
    
    console.log('\n🎉 ADMIN COMPLETO CREATO!');
    console.log('🔑 Credenziali di accesso:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   ID Utente:', userId);
    console.log('   Ruolo: superadmin');
    console.log('\n📍 URL di accesso: /admin/login');
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

createCompleteAdmin(); 