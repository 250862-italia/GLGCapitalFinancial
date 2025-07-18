const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  try {
    console.log('🚀 Creazione tabelle essenziali...');
    
    // Query per creare la tabella profiles
    const createProfilesQuery = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        date_of_birth DATE,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        kyc_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Query per creare la tabella clients
    const createClientsQuery = `
      CREATE TABLE IF NOT EXISTS clients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        client_code VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        risk_profile VARCHAR(50) DEFAULT 'moderate',
        investment_preferences JSONB DEFAULT '{}',
        total_invested DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Query per abilitare RLS
    const enableRLSProfiles = `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`;
    const enableRLSClients = `ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`;
    
    // Query per creare policy RLS
    const createProfilesPolicy = `
      CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY "Users can insert their own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    `;
    
    const createClientsPolicy = `
      CREATE POLICY "Users can view their own client data" ON clients
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own client data" ON clients
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own client data" ON clients
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;
    
    console.log('📋 Creazione tabella profiles...');
    // Nota: Non possiamo eseguire DDL direttamente con Supabase client
    // Dobbiamo usare il dashboard di Supabase
    
    console.log('⚠️ Impossibile creare tabelle tramite API');
    console.log('📝 Per favore esegui questo script SQL nel dashboard di Supabase:');
    console.log('');
    console.log('=== INIZIO SCRIPT SQL ===');
    console.log(createProfilesQuery);
    console.log(createClientsQuery);
    console.log(enableRLSProfiles);
    console.log(enableRLSClients);
    console.log(createProfilesPolicy);
    console.log(createClientsPolicy);
    console.log('=== FINE SCRIPT SQL ===');
    console.log('');
    console.log('🔗 Vai su: https://supabase.com/dashboard');
    console.log('📁 Seleziona il tuo progetto');
    console.log('⚡ Vai su "SQL Editor"');
    console.log('📋 Incolla lo script sopra e clicca "Run"');
    
  } catch (error) {
    console.error('💥 Errore:', error);
  }
}

// Esegui la creazione
createTables(); 