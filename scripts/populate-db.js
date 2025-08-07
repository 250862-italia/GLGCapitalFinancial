const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testClients = [
  {
    first_name: 'Mario',
    last_name: 'Rossi',
    email: 'mario.rossi@email.com',
    phone: '+39 333 1234567',
    company: 'Tech Solutions SRL',
    position: 'CEO',
    date_of_birth: '1985-03-15',
    nationality: 'Italiana',
    address: 'Via Roma 123',
    city: 'Milano',
    country: 'Italia',
    postal_code: '20100',
    iban: 'IT60X0542811101000000123456',
    bic: 'CRPPIT2P',
    account_holder: 'Mario Rossi',
    usdt_wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    status: 'active',
    risk_profile: 'moderate'
  },
  {
    first_name: 'Giulia',
    last_name: 'Bianchi',
    email: 'giulia.bianchi@email.com',
    phone: '+39 333 9876543',
    company: 'Design Studio',
    position: 'Creative Director',
    date_of_birth: '1990-07-22',
    nationality: 'Italiana',
    address: 'Corso Italia 456',
    city: 'Roma',
    country: 'Italia',
    postal_code: '00100',
    iban: 'IT60X0542811101000000654321',
    bic: 'CRPPIT2P',
    account_holder: 'Giulia Bianchi',
    usdt_wallet: '0x8ba1f109551bD432803012645Hac136c772c3cb',
    status: 'active',
    risk_profile: 'low'
  },
  {
    first_name: 'Luca',
    last_name: 'Verdi',
    email: 'luca.verdi@email.com',
    phone: '+39 333 5555555',
    company: 'Finance Corp',
    position: 'CFO',
    date_of_birth: '1982-11-08',
    nationality: 'Italiana',
    address: 'Piazza Navona 789',
    city: 'Roma',
    country: 'Italia',
    postal_code: '00186',
    iban: 'IT60X0542811101000000789012',
    bic: 'CRPPIT2P',
    account_holder: 'Luca Verdi',
    usdt_wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
    status: 'pending',
    risk_profile: 'high'
  }
];

const testPackages = [
  {
    name: 'Pacchetto Conservativo',
    description: 'Investimento a basso rischio con rendimenti stabili',
    min_investment: 10000,
    max_investment: 100000,
    expected_return: 5.5,
    duration_months: 12,
    risk_level: 'low',
    status: 'active'
  },
  {
    name: 'Pacchetto Bilanciato',
    description: 'Investimento equilibrato con rischio moderato',
    min_investment: 25000,
    max_investment: 250000,
    expected_return: 8.2,
    duration_months: 18,
    risk_level: 'moderate',
    status: 'active'
  },
  {
    name: 'Pacchetto Aggressivo',
    description: 'Investimento ad alto rischio con potenziali rendimenti elevati',
    min_investment: 50000,
    max_investment: 500000,
    expected_return: 12.5,
    duration_months: 24,
    risk_level: 'high',
    status: 'active'
  },
  {
    name: 'Pacchetto Crypto',
    description: 'Investimento specializzato in criptovalute',
    min_investment: 15000,
    max_investment: 150000,
    expected_return: 15.0,
    duration_months: 36,
    risk_level: 'high',
    status: 'draft'
  }
];

async function populateDatabase() {
  console.log('🚀 Iniziando popolamento database...');

  try {
    // Popola clienti
    console.log('📝 Inserendo clienti...');
    for (const client of testClients) {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Errore inserimento cliente:', error);
      } else {
        console.log('✅ Cliente inserito:', client.first_name, client.last_name);
      }
    }

    // Popola pacchetti
    console.log('📦 Inserendo pacchetti...');
    for (const pkg of testPackages) {
      const { data, error } = await supabase
        .from('packages')
        .insert({
          ...pkg,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Errore inserimento pacchetto:', error);
      } else {
        console.log('✅ Pacchetto inserito:', pkg.name);
      }
    }

    console.log('🎉 Popolamento completato con successo!');
    console.log(`📊 Inseriti ${testClients.length} clienti e ${testPackages.length} pacchetti`);

  } catch (error) {
    console.error('❌ Errore durante il popolamento:', error);
  }
}

// Esegui il popolamento
populateDatabase(); 