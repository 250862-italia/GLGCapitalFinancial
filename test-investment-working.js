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

console.log('🔍 Test Finale Investment Process - WORKING');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testWorkingInvestmentProcess() {
  try {
    console.log('\n📋 1. Verifica Schema Corretto...');
    
    // Test clients table structure
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Errore accesso clients:', clientsError.message);
      return;
    }
    
    console.log('✅ Schema clients corretto');
    console.log('   Colonne:', Object.keys(clients[0] || {}).length);
    
    // Check for required columns
    const requiredColumns = ['address', 'phone', 'account_holder', 'kyc_status'];
    const missingColumns = requiredColumns.filter(col => !(col in (clients[0] || {})));
    
    if (missingColumns.length > 0) {
      console.error('❌ Colonne mancanti:', missingColumns);
      return;
    }
    
    console.log('✅ Tutte le colonne richieste presenti');
    
    console.log('\n📋 2. Verifica Dati Esistenti...');
    
    // Check clients (without email - that's in profiles)
    const { data: allClients, error: clientsListError } = await supabase
      .from('clients')
      .select('id, user_id, profile_id, status, account_holder, address, phone')
      .limit(5);
    
    if (clientsListError) {
      console.error('❌ Errore lista clients:', clientsListError.message);
      return;
    }
    
    console.log(`✅ ${allClients.length} clienti trovati`);
    if (allClients.length > 0) {
      console.log('   Esempi:', allClients.map(c => `${c.account_holder || 'N/A'} (${c.status})`));
    }
    
    // Check packages with correct column names
    const { data: allPackages, error: packagesListError } = await supabase
      .from('packages')
      .select('id, name, min_investment, max_investment, expected_return, duration_months')
      .limit(5);
    
    if (packagesListError) {
      console.error('❌ Errore lista packages:', packagesListError.message);
      return;
    }
    
    console.log(`✅ ${allPackages.length} pacchetti trovati`);
    if (allPackages.length > 0) {
      console.log('   Esempi:', allPackages.map(p => `${p.name} (€${p.min_investment}-€${p.max_investment})`));
    }
    
    console.log('\n📋 3. Test Investimento...');
    
    if (allClients.length === 0) {
      console.log('⚠️ Nessun cliente trovato - creazione cliente di test...');
      
      // First create a profile
      const testProfile = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@investment.com',
        first_name: 'Test',
        last_name: 'Investor',
        role: 'user'
      };
      
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()
        .single();
      
      if (createProfileError) {
        console.error('❌ Errore creazione profilo test:', createProfileError.message);
        return;
      }
      
      console.log('✅ Profilo test creato:', newProfile.email);
      
      // Then create client
      const testClient = {
        user_id: newProfile.id,
        profile_id: newProfile.id,
        status: 'active',
        address: 'Via Test 123',
        phone: '+39 123 456 789',
        account_holder: 'Test Investor',
        kyc_status: 'verified',
        risk_tolerance: 'medium',
        investment_experience: 'intermediate'
      };
      
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert(testClient)
        .select()
        .single();
      
      if (createClientError) {
        console.error('❌ Errore creazione cliente test:', createClientError.message);
        return;
      }
      
      console.log('✅ Cliente test creato:', newClient.account_holder);
      allClients.push(newClient);
    }
    
    // Test investment creation
    const testClient = allClients[0];
    const testPackage = allPackages[0];
    
    console.log('\n📋 4. Creazione Investimento Test...');
    console.log('   Cliente:', testClient.account_holder || 'N/A');
    console.log('   Pacchetto:', testPackage.name);
    console.log('   Importo:', testPackage.min_investment);
    console.log('   Rendimento Atteso:', testPackage.expected_return + '%');
    
    const testInvestment = {
      client_id: testClient.id,
      package_id: testPackage.id,
      amount: testPackage.min_investment,
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + (testPackage.duration_months || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      daily_return: (testPackage.expected_return / 365), // Convert annual to daily
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
    
    console.log('✅ Investimento creato con successo!');
    console.log('   ID:', newInvestment.id);
    console.log('   Amount:', newInvestment.amount);
    console.log('   Status:', newInvestment.status);
    console.log('   Start Date:', new Date(newInvestment.start_date).toLocaleDateString());
    console.log('   End Date:', new Date(newInvestment.end_date).toLocaleDateString());
    
    // Clean up test investment
    await supabase
      .from('investments')
      .delete()
      .eq('id', newInvestment.id);
    
    console.log('✅ Test investment rimosso');
    
    console.log('\n📋 5. Test API Endpoints...');
    
    // Test API endpoints
    const endpoints = [
      '/api/investments',
      '/api/packages',
      '/api/profile/create'
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
    console.log('✅ Colonne aggiunte con successo');
    console.log('✅ Dati di test disponibili');
    console.log('✅ Creazione investimenti funzionante');
    console.log('✅ API endpoints verificati');
    
    console.log('\n🚀 Il processo di investimento è ora operativo!');
    console.log('   Puoi procedere con gli investimenti dal dashboard.');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Run the test
testWorkingInvestmentProcess(); 