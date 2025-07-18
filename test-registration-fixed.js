const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRegistration() {
  try {
    console.log('🧪 Test registrazione cliente...');
    
    // Dati di test
    const testUser = {
      email: `test.cliente.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Cliente',
      name: 'Test Cliente'
    };
    
    console.log('📧 Email di test:', testUser.email);
    
    // 1. Crea utente in auth
    console.log('1️⃣ Creazione utente in auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        name: testUser.name
      }
    });
    
    if (authError) {
      console.error('❌ Errore creazione utente:', authError);
      return;
    }
    
    console.log('✅ Utente creato:', authData.user.id);
    
    // 2. Crea profilo
    console.log('2️⃣ Creazione profilo...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: testUser.name,
        email: testUser.email,
        role: 'user',
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError);
    } else {
      console.log('✅ Profilo creato');
    }
    
    // 3. Crea cliente
    console.log('3️⃣ Creazione cliente...');
    const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const { error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authData.user.id,
        profile_id: authData.user.id,
        client_code: clientCode,
        status: 'active',
        risk_profile: 'moderate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (clientError) {
      console.error('❌ Errore creazione cliente:', clientError);
    } else {
      console.log('✅ Cliente creato con codice:', clientCode);
    }
    
    // 4. Verifica finale
    console.log('4️⃣ Verifica finale...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id);
    
    if (profilesError) {
      console.error('❌ Errore verifica profili:', profilesError);
    } else {
      console.log('✅ Profili trovati:', profiles.length);
    }
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', authData.user.id);
    
    if (clientsError) {
      console.error('❌ Errore verifica clienti:', clientsError);
    } else {
      console.log('✅ Clienti trovati:', clients.length);
    }
    
    console.log('🎉 Test completato!');
    
  } catch (error) {
    console.error('💥 Errore durante il test:', error);
  }
}

// Esegui il test
testRegistration(); 