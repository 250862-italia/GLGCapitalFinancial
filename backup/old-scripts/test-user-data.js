// Script per testare la registrazione con i dati specifici dell'utente
const http = require('http');

async function testUserData() {
  console.log('🧪 Test registrazione con dati utente specifici...\n');

  const userData = {
    email: 'millionsgallery@icloud.com',
    password: 'TestPassword123!',
    firstName: 'Gino',
    lastName: 'Pino',
    country: 'italia'
  };

  const postData = JSON.stringify(userData);

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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('📥 Risposta dal server:');
      console.log('Status:', res.statusCode);
      console.log('Status Text:', res.statusText);
      console.log('Content-Type:', res.headers['content-type']);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📄 Dati ricevuti:');
        console.log(data);
        
        try {
          const responseData = JSON.parse(data);
          console.log('\n📋 Risposta parsata:');
          console.log(JSON.stringify(responseData, null, 2));

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('\n✅ Registrazione riuscita!');
            console.log('Utente creato con ID:', responseData.user?.id);
            console.log('Profilo cliente creato con ID:', responseData.client?.id);
          } else {
            console.log('\n❌ Registrazione fallita!');
            console.log('Errore:', responseData.error);
          }
          resolve(responseData);
        } catch (parseError) {
          console.error('❌ Errore parsing JSON:', parseError.message);
          console.log('Raw response:', data);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Errore di rete:', error.message);
      reject(error);
    });

    console.log('📤 Invio richiesta con dati utente:');
    console.log(JSON.stringify(userData, null, 2));

    req.write(postData);
    req.end();
  });
}

testUserData().catch(console.error); 