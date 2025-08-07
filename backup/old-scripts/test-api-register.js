// Script per testare direttamente l'API di registrazione
const http = require('http');

async function testApiRegister() {
  console.log('🧪 Test API registrazione...\n');

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
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('📥 Risposta ricevuta:');
      console.log('Status:', res.statusCode);
      console.log('Status Text:', res.statusMessage);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          console.log('Response Body:', JSON.stringify(responseData, null, 2));

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Registrazione riuscita!');
          } else {
            console.log('❌ Registrazione fallita!');
            console.log('Errore:', responseData.error);
          }
          resolve(responseData);
        } catch (error) {
          console.error('❌ Errore parsing JSON:', error.message);
          console.log('Raw response:', data);
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

    req.write(postData);
    req.end();
  });
}

testApiRegister().catch(console.error); 