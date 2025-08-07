// Script per simulare esattamente quello che fa il browser
const http = require('http');

async function testBrowserSimulation() {
  console.log('🌐 Simulazione browser...\n');

  const testUser = {
    email: `browser-test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Browser',
    lastName: 'Test',
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
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/register',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('📥 Risposta dal server:');
      console.log('Status:', res.statusCode);
      console.log('Status Text:', res.statusMessage);
      console.log('Content-Type:', res.headers['content-type']);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📄 Dati ricevuti (primi 500 caratteri):', data.substring(0, 500));
        
        // Simula la logica del browser/frontend
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(data);
            console.log('✅ Browser: Parsing JSON riuscito');
            console.log('✅ Browser: Registrazione riuscita');
            console.log('✅ Browser: Dovrebbe mostrare messaggio di successo');
            console.log('✅ Browser: Dovrebbe reindirizzare a /login');
            resolve(responseData);
          } catch (parseError) {
            console.error('❌ Browser: Errore parsing JSON:', parseError.message);
            console.log('❌ Browser: Dovrebbe mostrare errore di rete');
            reject(parseError);
          }
        } else {
          try {
            const responseData = JSON.parse(data);
            console.log('❌ Browser: Errore dal server:', responseData.error);
            console.log('❌ Browser: Dovrebbe mostrare errore:', responseData.error);
            resolve(responseData);
          } catch (parseError) {
            console.error('❌ Browser: Errore parsing JSON per errore:', parseError.message);
            console.log('❌ Browser: Dovrebbe mostrare errore generico');
            reject(parseError);
          }
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Browser: Errore di rete:', error.message);
      console.log('❌ Browser: Dovrebbe mostrare "Network error. Please try again."');
      reject(error);
    });

    console.log('📤 Browser: Invio richiesta fetch a /api/auth/register');
    console.log('📤 Browser: Dati inviati:', testUser);
    console.log('📤 Browser: Headers:', options.headers);

    req.write(postData);
    req.end();
  });
}

// Test con diversi scenari
async function runBrowserTests() {
  console.log('='.repeat(60));
  console.log('TEST 1: Simulazione browser normale');
  console.log('='.repeat(60));
  await testBrowserSimulation().catch(console.error);

  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Test con dati mancanti (simula errore 400)');
  console.log('='.repeat(60));
  
  const invalidUser = {
    email: 'test@example.com',
    password: '123', // Password troppo corta
    // firstName e lastName mancanti
  };

  const postData = JSON.stringify(invalidUser);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/register'
    }
  };

  await new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status per dati invalidi:', res.statusCode);
        try {
          const responseData = JSON.parse(data);
          console.log('Errore validazione:', responseData.error);
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

runBrowserTests().catch(console.error); 