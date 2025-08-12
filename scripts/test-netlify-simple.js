const https = require('https');

console.log('🧪 TEST SEMPLIFICATO NETLIFY FUNCTIONS');
console.log('========================================');
console.log('🌐 URL: https://glgcapitalfinancial.netlify.app');
console.log('');

// Configurazione
const BASE_URL = 'https://glgcapitalfinancial.netlify.app';
const ADMIN_TOKEN = 'admin_test_token_123';

// Funzione per fare richieste HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN,
        ...options.headers
      }
    };

    if (options.body) {
      const body = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test semplice per clients
async function testClientsSimple() {
  console.log('👥 TESTING CLIENTS API...');
  
  try {
    // Test GET
    console.log('  📋 GET /api/admin/clients...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/clients`);
    console.log(`    Status: ${getResponse.status}`);
    
    if (getResponse.status === 200) {
      console.log('    ✅ API funzionante!');
      console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    } else {
      console.log(`    ❌ API non funzionante: ${getResponse.status}`);
      console.log(`    Response: ${getResponse.data.substring(0, 200)}...`);
    }
    
    return getResponse.status === 200;
    
  } catch (error) {
    console.log(`  ❌ ERRORE: ${error.message}`);
    return false;
  }
}

// Test semplice per packages
async function testPackagesSimple() {
  console.log('📦 TESTING PACKAGES API...');
  
  try {
    // Test GET
    console.log('  📋 GET /api/admin/packages...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/packages`);
    console.log(`    Status: ${getResponse.status}`);
    
    if (getResponse.status === 200) {
      console.log('    ✅ API funzionante!');
      console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    } else {
      console.log(`    ❌ API non funzionante: ${getResponse.status}`);
      console.log(`    Response: ${getResponse.data.substring(0, 200)}...`);
    }
    
    return getResponse.status === 200;
    
  } catch (error) {
    console.log(`  ❌ ERRORE: ${error.message}`);
    return false;
  }
}

// Test principale
async function runSimpleTests() {
  console.log('🚀 INIZIO TEST SEMPLIFICATO...\n');
  
  const results = {
    clients: false,
    packages: false
  };
  
  try {
    // Test entità base
    results.clients = await testClientsSimple();
    console.log('');
    results.packages = await testPackagesSimple();
    
    // Risultati finali
    console.log('\n🎯 RISULTATI TEST SEMPLIFICATO');
    console.log('================================');
    console.log(`👥 Clients: ${results.clients ? '✅' : '❌'}`);
    console.log(`📦 Packages: ${results.packages ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n📊 SUCCESSO: ${successCount}/${totalCount} API testate`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 TUTTE LE API FUNZIONANO! SISTEMA OPERATIVO!');
    } else {
      console.log('\n⚠️  ALCUNE API NON FUNZIONANO - Controlla la configurazione');
    }
    
  } catch (error) {
    console.error('❌ ERRORE GENERALE DURANTE I TEST:', error);
  }
}

// Esegui test se chiamato direttamente
if (require.main === module) {
  runSimpleTests();
}

module.exports = { runSimpleTests }; 