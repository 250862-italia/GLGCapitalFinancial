const https = require('https');

console.log('🧪 TEST CRUD COMPLETO SU NETLIFY');
console.log('==================================');
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

// Test CRUD per Clients
async function testClientsCRUD() {
  console.log('👥 TESTING CLIENTS CRUD...');
  
  try {
    // GET - Lista clients
    console.log('  📋 GET /api/admin/clients...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/clients`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuovo client
    console.log('  ➕ POST /api/admin/clients...');
    const newClient = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+39 333 1234567',
      company: 'Test Company',
      position: 'Manager',
      date_of_birth: '1990-01-01',
      nationality: 'Italiana',
      address: 'Via Test 123',
      city: 'Milano',
      country: 'Italia',
      postal_code: '20100',
      iban: 'IT60X0542811101000000000002',
      bic: 'CRPPIT2P',
      account_holder: 'Test User',
      usdt_wallet: '0x1111111111111111111111111111111111111111',
      status: 'active',
      risk_profile: 'moderate'
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/clients`, {
      method: 'POST',
      body: newClient
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const clientId = postResponse.data.id;
      
      // PUT - Aggiorna client
      console.log(`  ✏️  PUT /api/admin/clients/${clientId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/clients`, {
        method: 'PUT',
        body: { id: clientId, first_name: 'Updated Test' }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina client
      console.log(`  🗑️  DELETE /api/admin/clients/${clientId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/clients`, {
        method: 'DELETE',
        body: { id: clientId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ CLIENTS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE CLIENTS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Packages
async function testPackagesCRUD() {
  console.log('📦 TESTING PACKAGES CRUD...');
  
  try {
    // GET - Lista packages
    console.log('  📋 GET /api/admin/packages...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/packages`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuovo package
    console.log('  ➕ POST /api/admin/packages...');
    const newPackage = {
      name: 'Test Package',
      description: 'Pacchetto di test',
      min_investment: 5000,
      max_investment: 50000,
      expected_return: 7.5,
      duration_months: 24,
      risk_level: 'medium',
      status: 'active'
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/packages`, {
      method: 'POST',
      body: newPackage
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const packageId = postResponse.data.id;
      
      // PUT - Aggiorna package
      console.log(`  ✏️  PUT /api/admin/packages/${packageId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/packages`, {
        method: 'PUT',
        body: { id: packageId, name: 'Updated Test Package' }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina package
      console.log(`  🗑️  DELETE /api/admin/packages/${packageId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/packages`, {
        method: 'DELETE',
        body: { id: packageId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ PACKAGES CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE PACKAGES CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Investments
async function testInvestmentsCRUD() {
  console.log('💰 TESTING INVESTMENTS CRUD...');
  
  try {
    // GET - Lista investments
    console.log('  📋 GET /api/admin/investments...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/investments`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuovo investment
    console.log('  ➕ POST /api/admin/investments...');
    const newInvestment = {
      client_id: '1',
      package_id: '1',
      amount: 10000,
      investment_date: new Date().toISOString(),
      status: 'active',
      expected_return: 5.0,
      duration_months: 12
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/investments`, {
      method: 'POST',
      body: newInvestment
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const investmentId = postResponse.data.id;
      
      // PUT - Aggiorna investment
      console.log(`  ✏️  PUT /api/admin/investments/${investmentId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/investments`, {
        method: 'PUT',
        body: { id: investmentId, amount: 15000 }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina investment
      console.log(`  🗑️  DELETE /api/admin/investments/${investmentId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/investments`, {
        method: 'DELETE',
        body: { id: investmentId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ INVESTMENTS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE INVESTMENTS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Payments
async function testPaymentsCRUD() {
  console.log('💳 TESTING PAYMENTS CRUD...');
  
  try {
    // GET - Lista payments
    console.log('  📋 GET /api/admin/payments...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/payments`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuovo payment
    console.log('  ➕ POST /api/admin/payments...');
    const newPayment = {
      client_id: '1',
      investment_id: '1',
      amount: 1000,
      payment_date: new Date().toISOString(),
      payment_method: 'bank_transfer',
      status: 'completed',
      reference: 'TEST-001'
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/payments`, {
      method: 'POST',
      body: newPayment
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const paymentId = postResponse.data.id;
      
      // PUT - Aggiorna payment
      console.log(`  ✏️  PUT /api/admin/payments/${paymentId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/payments`, {
        method: 'PUT',
        body: { id: paymentId, amount: 1500 }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina payment
      console.log(`  🗑️  DELETE /api/admin/payments/${paymentId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/payments`, {
        method: 'DELETE',
        body: { id: paymentId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ PAYMENTS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE PAYMENTS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Team Members
async function testTeamMembersCRUD() {
  console.log('👨‍💼 TESTING TEAM MEMBERS CRUD...');
  
  try {
    // GET - Lista team members
    console.log('  📋 GET /api/admin/team...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/team`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuovo team member
    console.log('  ➕ POST /api/admin/team...');
    const newTeamMember = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@glgcapital.com',
      phone: '+39 333 9876543',
      position: 'Financial Advisor',
      department: 'Investment',
      hire_date: new Date().toISOString(),
      status: 'active',
      salary: 50000
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/team`, {
      method: 'POST',
      body: newTeamMember
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const teamMemberId = postResponse.data.id;
      
      // PUT - Aggiorna team member
      console.log(`  ✏️  PUT /api/admin/team/${teamMemberId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/team`, {
        method: 'PUT',
        body: { id: teamMemberId, position: 'Senior Financial Advisor' }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina team member
      console.log(`  🗑️  DELETE /api/admin/team/${teamMemberId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/team`, {
        method: 'DELETE',
        body: { id: teamMemberId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ TEAM MEMBERS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE TEAM MEMBERS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Partnerships
async function testPartnershipsCRUD() {
  console.log('🤝 TESTING PARTNERSHIPS CRUD...');
  
  try {
    // GET - Lista partnerships
    console.log('  📋 GET /api/admin/partnerships...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/partnerships`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuova partnership
    console.log('  ➕ POST /api/admin/partnerships...');
    const newPartnership = {
      name: 'Test Partnership',
      description: 'Partnership di test',
      partner_type: 'financial_institution',
      start_date: new Date().toISOString(),
      status: 'active',
      value: 1000000,
      contact_person: 'Test Contact',
      contact_email: 'contact@testpartnership.com'
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/partnerships`, {
      method: 'POST',
      body: newPartnership
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const partnershipId = postResponse.data.id;
      
      // PUT - Aggiorna partnership
      console.log(`  ✏️  PUT /api/admin/partnerships/${partnershipId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/partnerships`, {
        method: 'PUT',
        body: { id: partnershipId, value: 1500000 }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina partnership
      console.log(`  🗑️  DELETE /api/admin/partnerships/${partnershipId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/partnerships`, {
        method: 'DELETE',
        body: { id: partnershipId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ PARTNERSHIPS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE PARTNERSHIPS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test CRUD per Analytics
async function testAnalyticsCRUD() {
  console.log('📊 TESTING ANALYTICS CRUD...');
  
  try {
    // GET - Lista analytics
    console.log('  📋 GET /api/admin/analytics...');
    const getResponse = await makeRequest(`${BASE_URL}/api/admin/analytics`);
    console.log(`    Status: ${getResponse.status}`);
    console.log(`    Data: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
    
    // POST - Crea nuova analytics
    console.log('  ➕ POST /api/admin/analytics...');
    const newAnalytics = {
      metric_name: 'total_investments',
      metric_value: 1000000,
      date: new Date().toISOString(),
      category: 'financial',
      status: 'active',
      description: 'Valore totale degli investimenti'
    };
    
    const postResponse = await makeRequest(`${BASE_URL}/api/admin/analytics`, {
      method: 'POST',
      body: newAnalytics
    });
    console.log(`    Status: ${postResponse.status}`);
    console.log(`    Data: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
    
    if (postResponse.data && postResponse.data.id) {
      const analyticsId = postResponse.data.id;
      
      // PUT - Aggiorna analytics
      console.log(`  ✏️  PUT /api/admin/analytics/${analyticsId}...`);
      const updateResponse = await makeRequest(`${BASE_URL}/api/admin/analytics`, {
        method: 'PUT',
        body: { id: analyticsId, metric_value: 1500000 }
      });
      console.log(`    Status: ${updateResponse.status}`);
      console.log(`    Data: ${JSON.stringify(updateResponse.data).substring(0, 100)}...`);
      
      // DELETE - Elimina analytics
      console.log(`  🗑️  DELETE /api/admin/analytics/${analyticsId}...`);
      const deleteResponse = await makeRequest(`${BASE_URL}/api/admin/analytics`, {
        method: 'DELETE',
        body: { id: analyticsId }
      });
      console.log(`    Status: ${deleteResponse.status}`);
      console.log(`    Data: ${JSON.stringify(deleteResponse.data).substring(0, 100)}...`);
    }
    
    console.log('  ✅ ANALYTICS CRUD TEST COMPLETATO\n');
    return true;
    
  } catch (error) {
    console.log(`  ❌ ERRORE ANALYTICS CRUD: ${error.message}\n`);
    return false;
  }
}

// Test principale
async function runAllTests() {
  console.log('🚀 INIZIO TEST COMPLETO CRUD SU NETLIFY\n');
  
  const results = {
    clients: false,
    packages: false,
    investments: false,
    payments: false,
    teamMembers: false,
    partnerships: false,
    analytics: false
  };
  
  try {
    // Test tutte le entità
    results.clients = await testClientsCRUD();
    results.packages = await testPackagesCRUD();
    results.investments = await testInvestmentsCRUD();
    results.payments = await testPaymentsCRUD();
    results.teamMembers = await testTeamMembersCRUD();
    results.partnerships = await testPartnershipsCRUD();
    results.analytics = await testAnalyticsCRUD();
    
    // Risultati finali
    console.log('🎯 RISULTATI FINALI TEST CRUD');
    console.log('==============================');
    console.log(`👥 Clients: ${results.clients ? '✅' : '❌'}`);
    console.log(`📦 Packages: ${results.packages ? '✅' : '❌'}`);
    console.log(`💰 Investments: ${results.investments ? '✅' : '❌'}`);
    console.log(`💳 Payments: ${results.payments ? '✅' : '❌'}`);
    console.log(`👨‍💼 Team Members: ${results.teamMembers ? '✅' : '❌'}`);
    console.log(`🤝 Partnerships: ${results.partnerships ? '✅' : '❌'}`);
    console.log(`📊 Analytics: ${results.analytics ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n📊 SUCCESSO: ${successCount}/${totalCount} entità testate`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 TUTTI I TEST CRUD SUPERATI! SISTEMA FUNZIONANTE!');
    } else {
      console.log('\n⚠️  ALCUNI TEST FALLITI - Controlla i log per dettagli');
    }
    
  } catch (error) {
    console.error('❌ ERRORE GENERALE DURANTE I TEST:', error);
  }
}

// Esegui test se chiamato direttamente
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests }; 