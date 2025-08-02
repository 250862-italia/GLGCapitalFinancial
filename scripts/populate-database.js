#!/usr/bin/env node

/**
 * Script per popolare il database Supabase con dati mock
 * Usage: node scripts/populate-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dati mock per i clienti
const mockClients = [
  {
    user_id: 'user_1',
    profile_id: 'profile_1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Tech Solutions Inc.',
    position: 'CEO',
    date_of_birth: '1985-03-15',
    nationality: 'United States',
    profile_photo: '',
    address: '123 Main Street',
    city: 'New York',
    country: 'United States',
    postal_code: '10001',
    iban: 'US12345678901234567890',
    bic: 'USABANK123',
    account_holder: 'John Doe',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI001',
    status: 'active',
    risk_profile: 'moderate',
    investment_preferences: { type: 'balanced', sectors: ['tech', 'finance'] },
    total_invested: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user_2',
    profile_id: 'profile_2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    company: 'Global Investments Ltd.',
    position: 'CFO',
    date_of_birth: '1988-07-22',
    nationality: 'United Kingdom',
    profile_photo: '',
    address: '456 Business Avenue',
    city: 'London',
    country: 'United Kingdom',
    postal_code: 'SW1A 1AA',
    iban: 'GB12345678901234567890',
    bic: 'GBBANK123',
    account_holder: 'Jane Smith',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI002',
    status: 'active',
    risk_profile: 'conservative',
    investment_preferences: { type: 'conservative', sectors: ['real-estate', 'bonds'] },
    total_invested: 75000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user_3',
    profile_id: 'profile_3',
    first_name: 'Marco',
    last_name: 'Rossi',
    email: 'marco.rossi@example.com',
    phone: '+393334445556',
    company: 'Innovation Tech S.p.A.',
    position: 'CTO',
    date_of_birth: '1990-11-08',
    nationality: 'Italy',
    profile_photo: '',
    address: 'Via Roma 123',
    city: 'Milan',
    country: 'Italy',
    postal_code: '20100',
    iban: 'IT123456789012345678901234',
    bic: 'ITBANK123',
    account_holder: 'Marco Rossi',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI003',
    status: 'active',
    risk_profile: 'aggressive',
    investment_preferences: { type: 'aggressive', sectors: ['crypto', 'startups'] },
    total_invested: 100000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user_4',
    profile_id: 'profile_4',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+14155552671',
    company: 'Green Energy Corp.',
    position: 'VP Operations',
    date_of_birth: '1987-04-12',
    nationality: 'Canada',
    profile_photo: '',
    address: '789 Green Street',
    city: 'Toronto',
    country: 'Canada',
    postal_code: 'M5V 3A8',
    iban: 'CA12345678901234567890',
    bic: 'CABANK123',
    account_holder: 'Sarah Johnson',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI004',
    status: 'pending',
    risk_profile: 'moderate',
    investment_preferences: { type: 'balanced', sectors: ['renewable-energy', 'sustainability'] },
    total_invested: 25000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'user_5',
    profile_id: 'profile_5',
    first_name: 'Hans',
    last_name: 'Mueller',
    email: 'hans.mueller@example.com',
    phone: '+49123456789',
    company: 'Precision Engineering GmbH',
    position: 'Managing Director',
    date_of_birth: '1983-09-30',
    nationality: 'Germany',
    profile_photo: '',
    address: 'Industriestrasse 456',
    city: 'Berlin',
    country: 'Germany',
    postal_code: '10115',
    iban: 'DE12345678901234567890',
    bic: 'DEBANK123',
    account_holder: 'Hans Mueller',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI005',
    status: 'active',
    risk_profile: 'conservative',
    investment_preferences: { type: 'conservative', sectors: ['manufacturing', 'infrastructure'] },
    total_invested: 150000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Dati mock per i pacchetti
const mockPackages = [
  {
    name: 'Pacchetto Real Estate',
    description: 'Investimenti immobiliari sicuri con rendimenti garantiti',
    min_investment: 10000,
    max_investment: 50000,
    duration_months: 18,
    expected_return: 10.5,
    status: 'active',
    type: 'conservative',
    risk_level: 'low',
    created_at: new Date().toISOString()
  },
  {
    name: 'Pacchetto Tech Growth',
    description: 'Investimenti in startup tecnologiche ad alto potenziale',
    min_investment: 15000,
    max_investment: 75000,
    duration_months: 24,
    expected_return: 18.0,
    status: 'active',
    type: 'aggressive',
    risk_level: 'high',
    created_at: new Date().toISOString()
  },
  {
    name: 'Pacchetto Green Energy',
    description: 'Investimenti in energie rinnovabili e sostenibilità',
    min_investment: 8000,
    max_investment: 40000,
    duration_months: 30,
    expected_return: 12.5,
    status: 'active',
    type: 'balanced',
    risk_level: 'medium',
    created_at: new Date().toISOString()
  },
  {
    name: 'Pacchetto Starter',
    description: 'Pacchetto ideale per iniziare con investimenti sicuri',
    min_investment: 1000,
    max_investment: 5000,
    duration_months: 12,
    expected_return: 8.5,
    status: 'active',
    type: 'conservative',
    risk_level: 'low',
    created_at: new Date().toISOString()
  },
  {
    name: 'Pacchetto Growth',
    description: 'Pacchetto per crescita moderata con rischio bilanciato',
    min_investment: 5000,
    max_investment: 25000,
    duration_months: 24,
    expected_return: 12.0,
    status: 'active',
    type: 'balanced',
    risk_level: 'medium',
    created_at: new Date().toISOString()
  },
  {
    name: 'Pacchetto Premium',
    description: 'Pacchetto avanzato per investitori esperti',
    min_investment: 25000,
    max_investment: 100000,
    duration_months: 36,
    expected_return: 15.5,
    status: 'active',
    type: 'aggressive',
    risk_level: 'high',
    created_at: new Date().toISOString()
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  try {
    // Popola i clienti
    console.log('📝 Populating clients...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(mockClients)
      .select();

    if (clientsError) {
      console.error('❌ Error inserting clients:', clientsError);
    } else {
      console.log('✅ Clients populated successfully:', clientsData?.length || 0);
    }

    // Popola i pacchetti
    console.log('📦 Populating packages...');
    const { data: packagesData, error: packagesError } = await supabase
      .from('packages')
      .insert(mockPackages)
      .select();

    if (packagesError) {
      console.error('❌ Error inserting packages:', packagesError);
    } else {
      console.log('✅ Packages populated successfully:', packagesData?.length || 0);
    }

    console.log('🎉 Database population completed!');
    
    // Verifica i dati inseriti
    console.log('\n📊 Database Summary:');
    
    const { data: clientsCount } = await supabase
      .from('clients')
      .select('id', { count: 'exact' });
    
    const { data: packagesCount } = await supabase
      .from('packages')
      .select('id', { count: 'exact' });
    
    console.log(`- Clients: ${clientsCount?.length || 0}`);
    console.log(`- Packages: ${packagesCount?.length || 0}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

// Esegui lo script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase, mockClients, mockPackages }; 