// Test script per verificare l'upload della foto profilo
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

async function testPhotoUpload() {
  console.log('🧪 Test Upload Foto Profilo');
  console.log('============================');

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

    // 2. Test con FormData (simulato)
    console.log('\n2️⃣ Test upload foto (simulato)...');
    
    // Simula un file di test
    const testFormData = new FormData();
    testFormData.append('photo', new Blob(['test image data'], { type: 'image/jpeg' }), 'test.jpg');
    testFormData.append('user_id', 'test-user-id');

    const uploadResponse = await fetch(`${BASE_URL}/api/profile/upload-photo`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: testFormData
    });

    const uploadData = await uploadResponse.json().catch(() => ({}));
    
    if (uploadResponse.ok) {
      console.log('✅ Upload foto funzionante');
      console.log('   - URL foto:', uploadData.photo_url);
      console.log('   - Messaggio:', uploadData.message);
    } else {
      console.log('❌ Errore upload foto:', uploadResponse.status);
      console.log('   - Errore:', uploadData.error);
      
      // Se l'errore è "Invalid content type", il problema è risolto
      if (uploadData.error && uploadData.error.includes('Invalid content type')) {
        console.log('⚠️  Questo errore è atteso se il file non è valido');
      }
    }

    // 3. Test con dati JSON (dovrebbe fallire)
    console.log('\n3️⃣ Test con dati JSON (dovrebbe fallire)...');
    const jsonResponse = await makeRequest(`${BASE_URL}/api/profile/upload-photo`, {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({
        photo: 'fake-data',
        user_id: 'test-user-id'
      })
    });

    if (jsonResponse.status === 400 && jsonResponse.data.error && jsonResponse.data.error.includes('Invalid content type')) {
      console.log('✅ Validazione content-type funzionante');
      console.log('   - Errore atteso:', jsonResponse.data.error);
    } else {
      console.log('❌ Validazione content-type non funzionante');
      console.log('   - Status:', jsonResponse.status);
      console.log('   - Risposta:', jsonResponse.data);
    }

    console.log('\n🎉 Test completato!');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testPhotoUpload(); 