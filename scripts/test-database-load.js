#!/usr/bin/env node

/**
 * Script per testare il caricamento dei dati dal database
 * Usage: node scripts/test-database-load.js
 */

const fetch = require('node-fetch');

async function testDatabaseLoad() {
  console.log('🧪 Testing database data loading...');
  
  try {
    // Test clients sync
    console.log('\n📝 Testing clients sync...');
    const clientsResponse = await fetch('http://localhost:3000/api/admin/clients/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'test-admin-token'
      }
    });
    
    const clientsData = await clientsResponse.json();
    console.log('✅ Clients sync response:', {
      success: clientsData.success,
      message: clientsData.message,
      count: clientsData.data?.length || 0
    });
    
    if (clientsData.data && clientsData.data.length > 0) {
      console.log('📊 Sample client:', {
        id: clientsData.data[0].id,
        name: `${clientsData.data[0].first_name} ${clientsData.data[0].last_name}`,
        email: clientsData.data[0].email,
        status: clientsData.data[0].status
      });
    }
    
    // Test packages sync
    console.log('\n📦 Testing packages sync...');
    const packagesResponse = await fetch('http://localhost:3000/api/admin/packages/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'test-admin-token'
      }
    });
    
    const packagesData = await packagesResponse.json();
    console.log('✅ Packages sync response:', {
      success: packagesData.success,
      message: packagesData.message,
      count: packagesData.data?.length || 0
    });
    
    if (packagesData.data && packagesData.data.length > 0) {
      console.log('📊 Sample package:', {
        id: packagesData.data[0].id,
        name: packagesData.data[0].name,
        min_investment: packagesData.data[0].min_investment,
        status: packagesData.data[0].status
      });
    }
    
    console.log('\n🎉 Database load test completed!');
    console.log(`📊 Total clients: ${clientsData.data?.length || 0}`);
    console.log(`📦 Total packages: ${packagesData.data?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Database load test failed:', error.message);
  }
}

// Esegui il test
if (require.main === module) {
  testDatabaseLoad();
}

module.exports = { testDatabaseLoad }; 