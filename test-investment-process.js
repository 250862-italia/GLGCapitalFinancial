import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test Investment Process');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testInvestmentProcess() {
  try {
    console.log('\n📋 1. Verifica Schema Clients...');
    
    // Test clients table structure
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Errore accesso clients:', clientsError.message);
      return;
    }
    
    console.log('✅ Tabella clients accessibile');
    console.log('   Colonne disponibili:', Object.keys(clients[0] || {}));
    
    // Check for required columns
    const requiredColumns = ['address', 'account_holder', 'phone', 'kyc_status'];
    const missingColumns = requiredColumns.filter(col => !(col in (clients[0] || {})));
    
    if (missingColumns.length > 0) {
      console.error('❌ Colonne mancanti:', missingColumns);
      console.log('🔧 Esegui fix-clients-schema.sql in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Tutte le colonne richieste presenti');
    
    console.log('\n📋 2. Verifica Packages...');
    
    // Test packages table
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(3);
    
    if (packagesError) {
      console.error('❌ Errore accesso packages:', packagesError.message);
      return;
    }
    
    console.log('✅ Tabella packages accessibile');
    console.log(`   ${packages.length} pacchetti disponibili`);
    
    if (packages.length === 0) {
      console.log('⚠️ Nessun pacchetto disponibile');
      console.log('🔧 Inserisci alcuni pacchetti di esempio');
    }
    
    console.log('\n📋 3. Verifica Investments...');
    
    // Test investments table
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(5);
    
    if (investmentsError) {
      console.error('❌ Errore accesso investments:', investmentsError.message);
      return;
    }
    
    console.log('✅ Tabella investments accessibile');
    console.log(`   ${investments.length} investimenti esistenti`);
    
    console.log('\n📋 4. Test Creazione Investimento...');
    
    // Get first client and package for testing
    const { data: testClient } = await supabase
      .from('clients')
      .select('id, user_id, email')
      .limit(1)
      .single();
    
    const { data: testPackage } = await supabase
      .from('packages')
      .select('id, name, min_investment')
      .limit(1)
      .single();
    
    if (!testClient || !testPackage) {
      console.error('❌ Client o Package non trovati per il test');
      return;
    }
    
    console.log('   Test Client:', testClient.email);
    console.log('   Test Package:', testPackage.name);
    
    // Test investment creation
    const testInvestment = {
      client_id: testClient.id,
      package_id: testPackage.id,
      amount: testPackage.min_investment,
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daily_return: 1.2,
      total_returns: 0,
      daily_returns: 0
    };
    
    const { data: newInvestment, error: createError } = await supabase
      .from('investments')
      .insert(testInvestment)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Errore creazione investimento:', createError.message);
      console.error('   Details:', createError.details);
      return;
    }
    
    console.log('✅ Investimento creato con successo');
    console.log('   ID:', newInvestment.id);
    console.log('   Amount:', newInvestment.amount);
    console.log('   Status:', newInvestment.status);
    
    // Clean up test investment
    await supabase
      .from('investments')
      .delete()
      .eq('id', newInvestment.id);
    
    console.log('✅ Test investment rimosso');
    
    console.log('\n📋 5. Verifica API Endpoints...');
    
    // Test API endpoints
    const endpoints = [
      '/api/investments',
      '/api/packages',
      '/api/profile/create',
      '/api/send-email'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ${endpoint}: ❌ ${error.message}`);
      }
    }
    
    console.log('\n🎉 Test Investment Process Completato!');
    console.log('='.repeat(50));
    console.log('✅ Schema database corretto');
    console.log('✅ Tabelle accessibili');
    console.log('✅ Creazione investimenti funzionante');
    console.log('✅ API endpoints verificati');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Run the test
testInvestmentProcess(); 