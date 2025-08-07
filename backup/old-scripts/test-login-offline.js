#!/usr/bin/env node

/**
 * Script per testare il login offline
 * Usage: node scripts/test-login-offline.js
 */

const fetch = require('node-fetch');

async function testLoginOffline() {
  console.log('🧪 Testing offline login...');
  
  try {
    // Test login con utente offline
    console.log('\n📝 Testing login with prova@prova.com...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'prova@prova.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('✅ Login response:', {
      success: data.success,
      message: data.message,
      mode: data.mode,
      status: response.status
    });
    
    if (data.success) {
      console.log('🎉 Login successful!');
      console.log('👤 User:', data.user?.name);
      console.log('📧 Email:', data.user?.email);
      console.log('🔑 Mode:', data.mode);
    } else {
      console.log('❌ Login failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Esegui il test
if (require.main === module) {
  testLoginOffline();
}

module.exports = { testLoginOffline }; 