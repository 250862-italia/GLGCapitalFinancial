#!/usr/bin/env node

/**
 * Script per creare un utente admin direttamente nel database
 * Usage: node scripts/create-admin-simple.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminSimple() {
  console.log('🚀 Creazione utente admin semplice...');
  
  try {
    // Genera un ID UUID per l'admin
    const adminId = 'admin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Dati utente admin
    const adminData = {
      id: adminId,
      first_name: 'Admin',
      last_name: 'GLG',
      email: 'admin@glg.com',
      country: 'Italy',
      role: 'admin',
      kyc_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('👤 Creazione profilo admin...');
    
    // Crea profilo admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(adminData)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Errore creazione profilo:', profileError);
      return;
    }

    console.log('✅ Profilo admin creato:', profile.id);

    // Crea cliente admin
    console.log('👥 Creazione cliente admin...');
    const clientCode = `ADM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const clientData = {
      user_id: adminId,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      email: adminData.email,
      client_code: clientCode,
      status: 'active',
      risk_profile: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (clientError) {
      console.error('❌ Errore creazione cliente:', clientError);
    } else {
      console.log('✅ Cliente admin creato:', client.id);
    }

    console.log('\n🎉 Utente admin creato con successo!');
    console.log('📧 Email:', adminData.email);
    console.log('🆔 User ID:', adminId);
    console.log('👤 Role:', adminData.role);
    
    console.log('\n🔗 Credenziali per accesso admin:');
    console.log('   Email: admin@glg.com');
    console.log('   Password: Admin123!');
    console.log('   (Usa queste credenziali per il login admin)');

    // Salva le credenziali in localStorage per test
    const adminUser = {
      id: adminId,
      email: adminData.email,
      role: adminData.role,
      name: `${adminData.first_name} ${adminData.last_name}`
    };

    console.log('\n💾 Credenziali per localStorage:');
    console.log('localStorage.setItem("admin_user", JSON.stringify(' + JSON.stringify(adminUser) + '));');
    console.log('localStorage.setItem("admin_token", "admin-test-token");');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Esegui lo script
if (require.main === module) {
  createAdminSimple();
}

module.exports = { createAdminSimple }; 