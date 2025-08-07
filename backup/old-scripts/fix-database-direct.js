const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabaseDirect() {
  console.log('🔧 Fixing database schema directly...');
  
  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('⚠️ Connection test failed:', testError.message);
    } else {
      console.log('✅ Connection successful');
    }
    
    // Try to create a test client record to see what columns are missing
    console.log('\n🔍 Testing client table structure...');
    const testClient = {
      user_id: '00000000-0000-0000-0000-000000000000',
      profile_id: '00000000-0000-0000-0000-000000000000',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '',
      company: '',
      position: '',
      date_of_birth: null,
      nationality: '',
      profile_photo: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      iban: '',
      bic: '',
      account_holder: '',
      usdt_wallet: '',
      client_code: 'TEST-00000000-001',
      status: 'active',
      risk_profile: 'moderate',
      investment_preferences: {},
      total_invested: 0.00
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert(testClient)
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      
      // If it's a column error, we need to fix the schema
      if (insertError.message.includes('account_holder') || insertError.message.includes('column')) {
        console.log('\n🔧 Schema needs to be fixed. Please run the SQL script manually in Supabase SQL Editor:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of fix-database-schema.sql');
        console.log('4. Execute the script');
        console.log('\nOr use the following simplified SQL:');
        console.log(`
-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS usdt_wallet VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS position VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS iban VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bic VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_code VARCHAR(50) UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_profile VARCHAR(50) DEFAULT 'moderate';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_preferences JSONB DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_invested DECIMAL(15,2) DEFAULT 0.00;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);
        `);
      }
    } else {
      console.log('✅ Client table structure is correct');
      
      // Clean up test data
      await supabase
        .from('clients')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('✅ Test data cleaned up');
    }
    
    // Test profiles table
    console.log('\n🔍 Testing profiles table...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table is accessible');
    }
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  }
}

// Run the fix
fixDatabaseDirect(); 