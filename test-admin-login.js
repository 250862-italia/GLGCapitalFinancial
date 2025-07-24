// Test script per verificare il login admin
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  return {
    status: response.status,
    data,
    ok: response.ok
  };
}

async function testAdminLogin() {
  console.log('🧪 Test Login Admin');
  console.log('==================');

  try {
    // 1. Ottieni CSRF token
    console.log('\n1️⃣ Ottenendo CSRF token...');
    const csrfResponse = await makeRequest(`${BASE_URL}/api/csrf`);
    if (csrfResponse.status !== 200) {
      console.log('❌ Errore ottenimento CSRF token:', csrfResponse.status);
      return;
    }
    const csrfToken = csrfResponse.data.token;
    console.log('✅ CSRF token ottenuto:', csrfToken.substring(0, 10) + '...');

    // 2. Test login admin
    console.log('\n2️⃣ Test login admin...');
    const loginData = {
      email: 'admin@glgcapital.com',
      password: 'Admin123!'
    };

    const loginResponse = await makeRequest(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(loginData)
    });

    console.log('📊 Risposta login:');
    console.log('   - Status:', loginResponse.status);
    console.log('   - Success:', loginResponse.data.success);
    
    if (loginResponse.ok && loginResponse.data.success) {
      console.log('✅ Login admin riuscito!');
      console.log('   - User ID:', loginResponse.data.user.id);
      console.log('   - Email:', loginResponse.data.user.email);
      console.log('   - Role:', loginResponse.data.user.role);
      console.log('   - Nome:', loginResponse.data.user.name);
      console.log('   - Session Token:', loginResponse.data.session.access_token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login admin fallito');
      console.log('   - Errore:', loginResponse.data.error);
      console.log('   - Dettagli:', loginResponse.data.details);
    }

    // 3. Test con credenziali alternative
    console.log('\n3️⃣ Test con credenziali alternative...');
    const altLoginData = {
      email: 'info@washtw.com',
      password: 'Nncgnn62*'
    };

    const altLoginResponse = await makeRequest(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify(altLoginData)
    });

    console.log('📊 Risposta login alternativo:');
    console.log('   - Status:', altLoginResponse.status);
    console.log('   - Success:', altLoginResponse.data.success);
    
    if (altLoginResponse.ok && altLoginResponse.data.success) {
      console.log('✅ Login alternativo riuscito!');
      console.log('   - User ID:', altLoginResponse.data.user.id);
      console.log('   - Email:', altLoginResponse.data.user.email);
      console.log('   - Role:', altLoginResponse.data.user.role);
    } else {
      console.log('❌ Login alternativo fallito');
      console.log('   - Errore:', altLoginResponse.data.error);
    }

    console.log('\n🎉 Test completato!');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testAdminLogin(); 