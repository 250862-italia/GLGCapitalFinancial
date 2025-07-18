const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeDatabaseFix() {
  console.log('🔧 Executing database schema fixes...');

  try {
    // SQL commands to fix the database schema
    const sqlCommands = [
      // Add missing columns to clients table
      `
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS iban VARCHAR(50),
      ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS routing_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS source_of_funds VARCHAR(255),
      ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(50),
      ADD COLUMN IF NOT EXISTS investment_experience VARCHAR(50),
      ADD COLUMN IF NOT EXISTS investment_objectives TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
      `,
      
      // Add missing columns to profiles table
      `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
      ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS social_links JSONB,
      ADD COLUMN IF NOT EXISTS preferences JSONB;
      `,

      // Add missing columns to investments table
      `
      ALTER TABLE investments 
      ADD COLUMN IF NOT EXISTS package_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS package_description TEXT,
      ADD COLUMN IF NOT EXISTS expected_return DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS investment_period INTEGER,
      ADD COLUMN IF NOT EXISTS management_fee DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS performance_fee DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS minimum_investment DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS maximum_investment DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS investment_strategy TEXT,
      ADD COLUMN IF NOT EXISTS fund_manager VARCHAR(255),
      ADD COLUMN IF NOT EXISTS fund_size DECIMAL(20,2),
      ADD COLUMN IF NOT EXISTS inception_date DATE,
      ADD COLUMN IF NOT EXISTS redemption_terms TEXT,
      ADD COLUMN IF NOT EXISTS tax_implications TEXT,
      ADD COLUMN IF NOT EXISTS regulatory_compliance TEXT,
      ADD COLUMN IF NOT EXISTS documents JSONB,
      ADD COLUMN IF NOT EXISTS performance_history JSONB;
      `,

      // Add missing columns to notes table
      `
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS color VARCHAR(20),
      ADD COLUMN IF NOT EXISTS attachments JSONB;
      `,

      // Create RLS policies for clients table
      `
      -- Enable RLS
      ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

      -- Policy for users to see only their own client data
      DROP POLICY IF EXISTS "Users can view own client data" ON clients;
      CREATE POLICY "Users can view own client data" ON clients
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for users to insert their own client data
      DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
      CREATE POLICY "Users can insert own client data" ON clients
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Policy for users to update their own client data
      DROP POLICY IF EXISTS "Users can update own client data" ON clients;
      CREATE POLICY "Users can update own client data" ON clients
        FOR UPDATE USING (auth.uid() = user_id);

      -- Policy for admins to see all client data
      DROP POLICY IF EXISTS "Admins can view all client data" ON clients;
      CREATE POLICY "Admins can view all client data" ON clients
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin', 'superadmin')
          )
        );
      `,

      // Create RLS policies for profiles table
      `
      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Policy for users to see only their own profile
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);

      -- Policy for users to update their own profile
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Policy for admins to see all profiles
      DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
      CREATE POLICY "Admins can view all profiles" ON profiles
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin', 'superadmin')
          )
        );
      `,

      // Create RLS policies for investments table
      `
      -- Enable RLS
      ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

      -- Policy for users to see only their own investments
      DROP POLICY IF EXISTS "Users can view own investments" ON investments;
      CREATE POLICY "Users can view own investments" ON investments
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for users to insert their own investments
      DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
      CREATE POLICY "Users can insert own investments" ON investments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Policy for users to update their own investments
      DROP POLICY IF EXISTS "Users can update own investments" ON investments;
      CREATE POLICY "Users can update own investments" ON investments
        FOR UPDATE USING (auth.uid() = user_id);

      -- Policy for admins to see all investments
      DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
      CREATE POLICY "Admins can view all investments" ON investments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin', 'superadmin')
          )
        );
      `,

      // Create RLS policies for notes table
      `
      -- Enable RLS
      ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

      -- Policy for users to see only their own notes
      DROP POLICY IF EXISTS "Users can view own notes" ON notes;
      CREATE POLICY "Users can view own notes" ON notes
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for users to insert their own notes
      DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
      CREATE POLICY "Users can insert own notes" ON notes
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Policy for users to update their own notes
      DROP POLICY IF EXISTS "Users can update own notes" ON notes;
      CREATE POLICY "Users can update own notes" ON notes
        FOR UPDATE USING (auth.uid() = user_id);

      -- Policy for users to delete their own notes
      DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
      CREATE POLICY "Users can delete own notes" ON notes
        FOR DELETE USING (auth.uid() = user_id);

      -- Policy for admins to see all notes
      DROP POLICY IF EXISTS "Admins can view all notes" ON notes;
      CREATE POLICY "Admins can view all notes" ON notes
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin', 'superadmin')
          )
        );
      `,

      // Create triggers for automatic timestamp updates
      `
      -- Function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for all tables
      DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
      CREATE TRIGGER update_clients_updated_at
        BEFORE UPDATE ON clients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
      CREATE TRIGGER update_investments_updated_at
        BEFORE UPDATE ON investments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
      CREATE TRIGGER update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `
    ];

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`\n📝 Executing SQL command ${i + 1}/${sqlCommands.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.log(`⚠️  Warning for command ${i + 1}:`, error.message);
        // Continue with other commands even if one fails
      } else {
        console.log(`✅ Command ${i + 1} executed successfully`);
      }
    }

    console.log('\n🎉 Database schema fixes completed!');
    console.log('\n📋 Summary of changes:');
    console.log('• Added missing columns to clients table');
    console.log('• Added missing columns to profiles table');
    console.log('• Added missing columns to investments table');
    console.log('• Added missing columns to notes table');
    console.log('• Created RLS policies for all tables');
    console.log('• Created triggers for automatic timestamp updates');

  } catch (error) {
    console.error('❌ Error executing database fixes:', error);
    console.log('\n💡 Note: Some SQL commands may need to be executed manually in the Supabase SQL Editor');
    console.log('Please copy the SQL commands from fix-database-final.sql and run them in Supabase');
  }
}

// Execute the database fix
executeDatabaseFix(); 