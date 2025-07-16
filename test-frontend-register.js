// Script per simulare esattamente quello che fa il frontend durante la registrazione
const http = require('http');

async function testFrontendRegister() {
  console.log('🧪 Test simulazione frontend registrazione...\n');

  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    country: 'Italy'
  };

  const postData = JSON.stringify(testUser);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('📥 Risposta ricevuta:');
      console.log('Status:', res.statusCode);
      console.log('Status Text:', res.statusMessage);
      console.log('Headers:', res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          console.log('Response Body:', JSON.stringify(responseData, null, 2));

          // Simula la logica del frontend
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Frontend: Registrazione riuscita!');
            console.log('Frontend dovrebbe mostrare messaggio di successo');
            console.log('Frontend dovrebbe reindirizzare a /login');
          } else {
            console.log('❌ Frontend: Registrazione fallita!');
            console.log('Frontend dovrebbe mostrare errore:', responseData.error);
          }
          resolve(responseData);
        } catch (error) {
          console.error('❌ Errore parsing JSON:', error.message);
          console.log('Raw response:', data);
          
          // Se non è JSON, potrebbe essere HTML (pagina di errore)
          if (data.includes('<!DOCTYPE html>')) {
            console.log('⚠️ Ricevuta pagina HTML invece di JSON - possibile errore 500');
          }
          
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Errore di rete:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Il server non è in esecuzione. Avvia con: npm run dev');
      }
      reject(error);
    });

    console.log('📤 Invio richiesta a /api/auth/register...');
    console.log('Dati utente:', testUser);
    console.log('Headers:', options.headers);

    req.write(postData);
    req.end();
  });
}

// Test con diversi scenari
async function runTests() {
  console.log('='.repeat(60));
  console.log('TEST 1: Registrazione normale');
  console.log('='.repeat(60));
  await testFrontendRegister().catch(console.error);

  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Email già esistente');
  console.log('='.repeat(60));
  
  // Usa la stessa email per testare il caso di duplicato
  const duplicateUser = {
    email: 'test-duplicate@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Duplicate',
    country: 'Italy'
  };

  const postData = JSON.stringify(duplicateUser);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  // Prima registrazione
  await new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Prima registrazione:', res.statusCode);
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });

  // Seconda registrazione (dovrebbe fallire)
  await new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Seconda registrazione (duplicato):', res.statusCode);
        try {
          const responseData = JSON.parse(data);
          console.log('Errore duplicato:', responseData.error);
        } catch (e) {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });
}

runTests().catch(console.error); 