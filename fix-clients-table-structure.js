const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixClientsTableStructure() {
  try {
    console.log('🔧 Fixing clients table structure...');

    // Check current table structure
    const { data: currentStructure, error: structureError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Error checking table structure:', structureError.message);
      
      // Try to create the table with full structure
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS clients (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          company TEXT,
          position TEXT,
          date_of_birth DATE,
          nationality TEXT,
          profile_photo TEXT,
          address TEXT,
          city TEXT,
          country TEXT,
          postal_code TEXT,
          iban TEXT,
          bic TEXT,
          account_holder TEXT,
          usdt_wallet TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.log('❌ Error creating table:', createError.message);
        return;
      }
      
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table exists, checking columns...');
      
      // Check if we have all the required columns
      const requiredColumns = [
        'company', 'position', 'date_of_birth', 'nationality', 
        'profile_photo', 'address', 'postal_code', 'iban', 
        'bic', 'account_holder', 'usdt_wallet'
      ];

      const sampleData = currentStructure[0] || {};
      const missingColumns = requiredColumns.filter(col => !(col in sampleData));

      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns:', missingColumns);
        
        // Add missing columns
        for (const column of missingColumns) {
          let columnType = 'TEXT';
          if (column === 'date_of_birth') columnType = 'DATE';
          
          const addColumnSQL = `ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${column} ${columnType};`;
          
          const { error: addError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
          
          if (addError) {
            console.log(`❌ Error adding column ${column}:`, addError.message);
          } else {
            console.log(`✅ Added column: ${column}`);
          }
        }
      } else {
        console.log('✅ All required columns exist');
      }
    }

    // Enable RLS and create policies
    const rlsSQL = `
      ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view own client data" ON clients;
      DROP POLICY IF EXISTS "Users can update own client data" ON clients;
      DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
      
      CREATE POLICY "Users can view own client data" ON clients
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own client data" ON clients
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own client data" ON clients
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.log('⚠️ RLS setup error:', rlsError.message);
    } else {
      console.log('✅ RLS policies updated');
    }

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
      CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    
    if (indexError) {
      console.log('⚠️ Index creation error:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (testError) {
      console.log('❌ Test query failed:', testError.message);
    } else {
      console.log('✅ Test query successful');
      console.log('📊 Found', testData.length, 'client records');
      
      if (testData.length > 0) {
        console.log('📋 Sample client data:', Object.keys(testData[0]));
      }
    }

    console.log('🎉 Clients table structure fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing clients table:', error);
  }
}

fixClientsTableStructure(); 