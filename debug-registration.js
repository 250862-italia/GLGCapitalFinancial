// Script per debug completo della registrazione
const http = require('http');

async function debugRegistration() {
  console.log('🔍 Debug completo registrazione...\n');

  const testUser = {
    email: `debug${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Debug',
    lastName: 'Test',
    country: 'Italy'
  };

  const postData = JSON.stringify(testUser);

  // Test 1: Richiesta normale
  console.log('='.repeat(60));
  console.log('TEST 1: Richiesta normale');
  console.log('='.repeat(60));

  const options1 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  await new Promise((resolve) => {
    const req = http.request(options1, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Response length:', data.length);
        console.log('Response preview:', data.substring(0, 200));
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });

  // Test 2: Richiesta con CORS headers
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Richiesta con CORS headers');
  console.log('='.repeat(60));

  const options2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type'
    }
  };

  await new Promise((resolve) => {
    const req = http.request(options2, (res) => {
      console.log('Status:', res.statusCode);
      console.log('CORS Headers:', {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      });
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Response length:', data.length);
        resolve();
      });
    });
    req.write(postData);
    req.end();
  });

  // Test 3: Richiesta OPTIONS (preflight)
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Richiesta OPTIONS (preflight)');
  console.log('='.repeat(60));

  const options3 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type'
    }
  };

  await new Promise((resolve) => {
    const req = http.request(options3, (res) => {
      console.log('OPTIONS Status:', res.statusCode);
      console.log('OPTIONS Headers:', res.headers);
      resolve();
    });
    req.end();
  });

  // Test 4: Verifica endpoint
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Verifica endpoint');
  console.log('='.repeat(60));

  const options4 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'GET'
  };

  await new Promise((resolve) => {
    const req = http.request(options4, (res) => {
      console.log('GET Status:', res.statusCode);
      console.log('GET Method not allowed:', res.statusCode === 405);
      resolve();
    });
    req.end();
  });

  console.log('\n' + '='.repeat(60));
  console.log('DEBUG COMPLETATO');
  console.log('='.repeat(60));
  console.log('Se tutti i test passano, il problema è nel frontend JavaScript');
  console.log('Controlla la console del browser per errori JavaScript');
}

debugRegistration().catch(console.error); 