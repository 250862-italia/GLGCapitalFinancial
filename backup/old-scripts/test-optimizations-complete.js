const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://glg-capital-financial.vercel.app' 
  : 'http://localhost:3001';

async function testOptimizations() {
  console.log('🚀 Test Completo Ottimizzazioni GLGCapitalFinancial');
  console.log('==================================================\n');

  const results = {
    database: { success: 0, total: 0, errors: [] },
    api: { success: 0, total: 0, errors: [] },
    performance: { success: 0, total: 0, errors: [] },
    security: { success: 0, total: 0, errors: [] }
  };

  try {
    // 1. Test Database e Tabelle
    console.log('1️⃣ Test Database e Tabelle...');
    
    // Test connessione Supabase
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      results.database.errors.push(`Connessione Supabase: ${healthError.message}`);
    } else {
      results.database.success++;
      console.log('✅ Connessione Supabase OK');
    }
    results.database.total++;

    // Test tabella profiles
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (error) {
        results.database.errors.push(`Tabella profiles: ${error.message}`);
      } else {
        results.database.success++;
        console.log(`✅ Tabella profiles OK (${profiles?.length || 0} record)`);
      }
    } catch (error) {
      results.database.errors.push(`Tabella profiles: ${error.message}`);
    }
    results.database.total++;

    // Test tabella clients
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .limit(5);
      
      if (error) {
        results.database.errors.push(`Tabella clients: ${error.message}`);
      } else {
        results.database.success++;
        console.log(`✅ Tabella clients OK (${clients?.length || 0} record)`);
      }
    } catch (error) {
      results.database.errors.push(`Tabella clients: ${error.message}`);
    }
    results.database.total++;

    console.log('');

    // 2. Test API Endpoints
    console.log('2️⃣ Test API Endpoints...');

    // Test health endpoint
    try {
      const healthResponse = await fetch(`${BASE_URL}/api/health`);
      const healthData = await healthResponse.json();
      
      if (healthResponse.ok && healthData.status === 'healthy') {
        results.api.success++;
        console.log('✅ Health endpoint OK');
      } else {
        results.api.errors.push(`Health endpoint: ${healthResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`Health endpoint: ${error.message}`);
    }
    results.api.total++;

    // Test performance endpoint
    try {
      const perfResponse = await fetch(`${BASE_URL}/api/performance`);
      const perfData = await perfResponse.json();
      
      if (perfResponse.ok && perfData.success) {
        results.api.success++;
        console.log('✅ Performance endpoint OK');
      } else {
        results.api.errors.push(`Performance endpoint: ${perfResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`Performance endpoint: ${error.message}`);
    }
    results.api.total++;

    // Test notes endpoint
    try {
      const notesResponse = await fetch(`${BASE_URL}/api/notes`);
      const notesData = await notesResponse.json();
      
      if (notesResponse.ok && Array.isArray(notesData)) {
        results.api.success++;
        console.log('✅ Notes endpoint OK');
      } else {
        results.api.errors.push(`Notes endpoint: ${notesResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`Notes endpoint: ${error.message}`);
    }
    results.api.total++;

    // Test CSRF endpoint
    try {
      const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
      const csrfData = await csrfResponse.json();
      
      if (csrfResponse.ok && csrfData.token) {
        results.api.success++;
        console.log('✅ CSRF endpoint OK');
      } else {
        results.api.errors.push(`CSRF endpoint: ${csrfResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`CSRF endpoint: ${error.message}`);
    }
    results.api.total++;

    console.log('');

    // 3. Test Performance e Caching
    console.log('3️⃣ Test Performance e Caching...');

    // Test caching delle note
    const startTime = Date.now();
    try {
      const notesResponse1 = await fetch(`${BASE_URL}/api/notes`);
      const notesData1 = await notesResponse1.json();
      
      const notesResponse2 = await fetch(`${BASE_URL}/api/notes`);
      const notesData2 = await notesResponse2.json();
      
      const cacheStatus1 = notesResponse1.headers.get('X-Cache');
      const cacheStatus2 = notesResponse2.headers.get('X-Cache');
      
      if (cacheStatus1 === 'MISS' && cacheStatus2 === 'HIT') {
        results.performance.success++;
        console.log('✅ Caching funziona correttamente');
      } else {
        results.performance.errors.push(`Caching: ${cacheStatus1} -> ${cacheStatus2}`);
      }
    } catch (error) {
      results.performance.errors.push(`Caching: ${error.message}`);
    }
    results.performance.total++;

    // Test performance headers
    try {
      const perfResponse = await fetch(`${BASE_URL}/api/performance`);
      const perfHeaders = perfResponse.headers;
      
      const hasPerfHeaders = perfHeaders.get('X-Performance-Monitor') === 'active';
      
      if (hasPerfHeaders) {
        results.performance.success++;
        console.log('✅ Performance monitoring attivo');
      } else {
        results.performance.errors.push('Performance monitoring non attivo');
      }
    } catch (error) {
      results.performance.errors.push(`Performance monitoring: ${error.message}`);
    }
    results.performance.total++;

    console.log('');

    // 4. Test Sicurezza
    console.log('4️⃣ Test Sicurezza...');

    // Test rate limiting
    try {
      const requests = [];
      for (let i = 0; i < 105; i++) {
        requests.push(fetch(`${BASE_URL}/api/health`));
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      if (rateLimited) {
        results.security.success++;
        console.log('✅ Rate limiting attivo');
      } else {
        results.security.errors.push('Rate limiting non attivo');
      }
    } catch (error) {
      results.security.errors.push(`Rate limiting: ${error.message}`);
    }
    results.security.total++;

    // Test security headers
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      const headers = response.headers;
      
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy'
      ];
      
      const hasSecurityHeaders = securityHeaders.every(header => 
        headers.get(header) !== null
      );
      
      if (hasSecurityHeaders) {
        results.security.success++;
        console.log('✅ Security headers presenti');
      } else {
        results.security.errors.push('Security headers mancanti');
      }
    } catch (error) {
      results.security.errors.push(`Security headers: ${error.message}`);
    }
    results.security.total++;

    // Test CORS
    try {
      const corsResponse = await fetch(`${BASE_URL}/api/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      if (corsResponse.status === 403) {
        results.security.success++;
        console.log('✅ CORS protection attiva');
      } else {
        results.security.errors.push('CORS protection non attiva');
      }
    } catch (error) {
      results.security.errors.push(`CORS: ${error.message}`);
    }
    results.security.total++;

    console.log('');

    // 5. Test Registrazione e Login
    console.log('5️⃣ Test Registrazione e Login...');

    const testEmail = `test.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    // Test registrazione
    try {
      const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
      const { token } = await csrfResponse.json();

      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
          country: 'Italy'
        })
      });

      const registerData = await registerResponse.json();
      
      if (registerResponse.ok && registerData.success) {
        results.api.success++;
        console.log('✅ Registrazione funziona');
      } else {
        results.api.errors.push(`Registrazione: ${registerData.error || registerResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`Registrazione: ${error.message}`);
    }
    results.api.total++;

    // Test login
    try {
      const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
      const { token } = await csrfResponse.json();

      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.success) {
        results.api.success++;
        console.log('✅ Login funziona');
      } else {
        results.api.errors.push(`Login: ${loginData.error || loginResponse.status}`);
      }
    } catch (error) {
      results.api.errors.push(`Login: ${error.message}`);
    }
    results.api.total++;

    console.log('');

    // 6. Report Finale
    console.log('📊 REPORT FINALE');
    console.log('================');

    const categories = Object.keys(results);
    let totalSuccess = 0;
    let totalTests = 0;

    categories.forEach(category => {
      const { success, total, errors } = results[category];
      const percentage = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
      
      console.log(`${category.toUpperCase()}: ${success}/${total} (${percentage}%)`);
      
      if (errors.length > 0) {
        console.log(`  ❌ Errori:`);
        errors.forEach(error => console.log(`    - ${error}`));
      }
      
      totalSuccess += success;
      totalTests += total;
    });

    const overallPercentage = totalTests > 0 ? ((totalSuccess / totalTests) * 100).toFixed(1) : 0;
    console.log(`\n🎯 TOTALE: ${totalSuccess}/${totalTests} (${overallPercentage}%)`);

    if (overallPercentage >= 90) {
      console.log('🎉 ECCELLENTE! Il sistema è ottimizzato e funziona perfettamente.');
    } else if (overallPercentage >= 75) {
      console.log('✅ BUONO! Il sistema funziona bene con alcune aree di miglioramento.');
    } else if (overallPercentage >= 50) {
      console.log('⚠️ DISCRETO! Ci sono problemi significativi da risolvere.');
    } else {
      console.log('❌ CRITICO! Il sistema ha molti problemi che richiedono attenzione immediata.');
    }

    // 7. Raccomandazioni
    console.log('\n💡 RACCOMANDAZIONI:');
    
    if (results.database.errors.length > 0) {
      console.log('- Verifica la configurazione del database Supabase');
      console.log('- Esegui gli script SQL per creare le tabelle mancanti');
    }
    
    if (results.api.errors.length > 0) {
      console.log('- Controlla la configurazione delle variabili d\'ambiente');
      console.log('- Verifica che tutti gli endpoint API siano accessibili');
    }
    
    if (results.performance.errors.length > 0) {
      console.log('- Ottimizza le query del database');
      console.log('- Verifica la configurazione del caching');
    }
    
    if (results.security.errors.length > 0) {
      console.log('- Verifica la configurazione del middleware di sicurezza');
      console.log('- Controlla i headers di sicurezza');
    }

  } catch (error) {
    console.error('❌ Errore generale durante i test:', error);
  }
}

// Esegui i test
testOptimizations(); 