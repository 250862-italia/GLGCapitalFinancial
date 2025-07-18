const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('🚀 Creating missing tables...');
    
    // Create profiles table
    console.log('📋 Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (profilesError) {
      console.log('⚠️ Profiles table creation error (might already exist):', profilesError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }
    
    // Create clients table
    console.log('📋 Creating clients table...');
    const { error: clientsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (clientsError) {
      console.log('⚠️ Clients table creation error (might already exist):', clientsError.message);
    } else {
      console.log('✅ Clients table created successfully');
    }
    
    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.log('⚠️ RLS enable error:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }
    
    // Create policies
    console.log('🔐 Creating RLS policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
        
        CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
        DROP POLICY IF EXISTS "Users can update their own client data" ON clients;
        DROP POLICY IF EXISTS "Users can insert their own client data" ON clients;
        
        CREATE POLICY "Users can view their own client data" ON clients
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own client data" ON clients
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own client data" ON clients
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });
    
    if (policiesError) {
      console.log('⚠️ Policies creation error:', policiesError.message);
    } else {
      console.log('✅ RLS policies created successfully');
    }
    
    console.log('🎉 Table creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createTables(); 