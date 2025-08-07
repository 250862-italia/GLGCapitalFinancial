#!/usr/bin/env node

/**
 * Script per creare un utente admin di test
 * Usage: node scripts/create-admin-test.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3Mjk3MCwiZXhwIjoyMDUwNTQ4OTcwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

console.log('🔧 Usando credenziali Supabase hardcoded per test');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminTest() {
  console.log('🚀 Creazione utente admin di test...');
  
  try {
    // Dati utente admin di test
    const adminData = {
      email: 'admin@glg.com',
      password: 'Admin123!',
      first_name: 'Admin',
      last_name: 'GLG',
      country: 'Italy',
      role: 'admin'
    };

    console.log('📝 Creazione utente auth...');
    
    // 1. Crea utente in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Errore creazione auth user:', authError);
      return;
    }

    console.log('✅ Utente auth creato:', authUser.user.id);

    // 2. Crea profilo
    console.log('👤 Creazione profilo...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        country: adminData.country,
        role: adminData.role,
        kyc_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError);
      return;
    }

    console.log('✅ Profilo creato:', profile.id);

    // 3. Crea cliente (opzionale)
    console.log('👥 Creazione cliente...');
    const clientCode = `ADM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authUser.user.id,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        client_code: clientCode,
        status: 'active',
        risk_profile: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('❌ Errore creazione cliente:', clientError);
    } else {
      console.log('✅ Cliente creato:', client.id);
    }

    console.log('\n🎉 Utente admin creato con successo!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('🆔 User ID:', authUser.user.id);
    console.log('👤 Role:', adminData.role);
    
    console.log('\n🔗 Puoi ora accedere a:');
    console.log('   http://localhost:3000/admin/login');
    console.log('   Email: admin@glg.com');
    console.log('   Password: Admin123!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Esegui lo script
if (require.main === module) {
  createAdminTest();
}

module.exports = { createAdminTest }; 