#!/usr/bin/env node

/**
 * Script di test per verificare la sincronizzazione clienti/pacchetti
 * Usage: node scripts/test-sync.js
 */

const fetch = require('node-fetch');

async function testSync() {
  console.log('🧪 Testing sync functionality...');
  
  try {
    // Test sync clients
    console.log('\n📝 Testing clients sync...');
    const clientsResponse = await fetch('http://localhost:3000/api/admin/clients/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'test-admin-token'
      }
    });
    
    const clientsData = await clientsResponse.json();
    console.log('✅ Clients sync response:', clientsData);
    
    // Test sync packages
    console.log('\n📦 Testing packages sync...');
    const packagesResponse = await fetch('http://localhost:3000/api/admin/packages/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'test-admin-token'
      }
    });
    
    const packagesData = await packagesResponse.json();
    console.log('✅ Packages sync response:', packagesData);
    
    console.log('\n🎉 Sync test completed!');
    
  } catch (error) {
    console.error('❌ Sync test failed:', error.message);
  }
}

// Esegui il test
if (require.main === module) {
  testSync();
}

module.exports = { testSync }; 