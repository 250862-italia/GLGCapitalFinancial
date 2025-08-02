#!/usr/bin/env node

/**
 * Script per aggiungere l'utente prova@prova.com al sistema offline
 * Usage: node scripts/add-offline-user.js
 */

const fs = require('fs');
const path = require('path');

// Dati utente registrato
const userData = {
  id: 'd528abbd-fa0f-4726-9185-1e3f4519f1ba',
  email: 'prova@prova.com',
  password: 'password123', // Password di default
  created_at: new Date().toISOString()
};

const profileData = {
  id: 'd528abbd-fa0f-4726-9185-1e3f4519f1ba',
  first_name: 'pippo',
  last_name: 'Paperino',
  country: 'Italy',
  role: 'user',
  kyc_status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const clientData = {
  id: 'cf59b6de-0b18-42ad-889c-67c93018f088',
  user_id: 'd528abbd-fa0f-4726-9185-1e3f4519f1ba',
  first_name: 'pippo',
  last_name: 'Paperino',
  email: 'prova@prova.com',
  client_code: 'CLI' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
  status: 'active',
  risk_profile: 'standard',
  total_invested: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

function addOfflineUser() {
  console.log('🚀 Aggiunta utente offline...');
  
  try {
    // Percorso file di storage offline
    const offlineDataPath = path.join(__dirname, '../lib/offline-data.json');
    
    // Carica dati esistenti o crea nuovo file
    let offlineData = { users: [], profiles: [], clients: [] };
    
    if (fs.existsSync(offlineDataPath)) {
      const existingData = fs.readFileSync(offlineDataPath, 'utf8');
      offlineData = JSON.parse(existingData);
    }
    
    // Aggiungi utente se non esiste già
    const existingUser = offlineData.users.find(u => u.email === userData.email);
    if (!existingUser) {
      offlineData.users.push(userData);
      console.log('✅ Utente aggiunto:', userData.email);
    } else {
      console.log('⚠️ Utente già esistente:', userData.email);
    }
    
    // Aggiungi profilo se non esiste già
    const existingProfile = offlineData.profiles.find(p => p.id === profileData.id);
    if (!existingProfile) {
      offlineData.profiles.push(profileData);
      console.log('✅ Profilo aggiunto:', profileData.first_name, profileData.last_name);
    } else {
      console.log('⚠️ Profilo già esistente');
    }
    
    // Aggiungi cliente se non esiste già
    const existingClient = offlineData.clients.find(c => c.user_id === clientData.user_id);
    if (!existingClient) {
      offlineData.clients.push(clientData);
      console.log('✅ Cliente aggiunto:', clientData.client_code);
    } else {
      console.log('⚠️ Cliente già esistente');
    }
    
    // Salva i dati
    fs.writeFileSync(offlineDataPath, JSON.stringify(offlineData, null, 2));
    
    console.log('\n🎉 Utente offline aggiunto con successo!');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Password:', userData.password);
    console.log('👤 Nome:', profileData.first_name, profileData.last_name);
    console.log('🆔 User ID:', userData.id);
    console.log('📊 Client Code:', clientData.client_code);
    
    console.log('\n🔗 Ora puoi accedere con:');
    console.log('   Email: prova@prova.com');
    console.log('   Password: password123');
    console.log('   URL: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

// Esegui lo script
if (require.main === module) {
  addOfflineUser();
}

module.exports = { addOfflineUser }; 