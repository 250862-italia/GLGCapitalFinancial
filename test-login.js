const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogin() {
  try {
    console.log('🧪 Test login utente...');
    
    // Email di test (usa l'ultimo utente creato)
    const testEmail = 'test.cliente.1752854527347@example.com';
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Email di test: ${testEmail}`);
    
    // 1. Test login
    console.log('1️⃣ Test login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('❌ Errore login:', authError);
      return;
    }
    
    if (!authData?.user) {
      console.error('❌ Nessun utente autenticato');
      return;
    }
    
    console.log('✅ Login effettuato con successo');
    console.log(`👤 Utente ID: ${authData.user.id}`);
    
    // 2. Recupera profilo
    console.log('2️⃣ Recupero profilo...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Errore recupero profilo:', profileError);
    } else {
      console.log('✅ Profilo recuperato con successo');
      console.log(`📋 Nome: ${profile.name}`);
      console.log(`📧 Email: ${profile.email}`);
      console.log(`🌍 Paese: ${profile.country}`);
    }
    
    // 3. Recupera cliente
    console.log('3️⃣ Recupero cliente...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (clientError) {
      console.error('❌ Errore recupero cliente:', clientError);
    } else {
      console.log('✅ Cliente recuperato con successo');
      console.log(`🏷️ Codice cliente: ${client.client_code}`);
      console.log(`📊 Status: ${client.status}`);
      console.log(`💰 Totale investito: ${client.total_invested}`);
    }
    
    // 4. Verifica finale
    console.log('4️⃣ Verifica finale...');
    const { count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('email', testEmail);
    
    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id);
    
    console.log(`✅ Profili trovati: ${profilesCount}`);
    console.log(`✅ Clienti trovati: ${clientsCount}`);
    
    console.log('🎉 Test login completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Esegui il test
testLogin(); 