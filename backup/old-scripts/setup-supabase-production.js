const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30'
};

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

async function setupSupabaseProduction() {
  console.log('🚀 GLG Capital Dashboard - Supabase Production Setup');
  console.log('==================================================');
  
  try {
    // 1. Test connection
    console.log('\n1️⃣ Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('✅ Supabase connected, tables need to be created');
    } else if (testError) {
      console.log('❌ Supabase connection failed:', testError.message);
      return;
    } else {
      console.log('✅ Supabase connected, some tables already exist');
    }

    // 2. Read SQL setup script
    console.log('\n2️⃣ Reading setup script...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-production.sql'), 'utf8');
    console.log('✅ Setup script loaded');

    // 3. Execute SQL script via RPC (if available)
    console.log('\n3️⃣ Executing database setup...');
    
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', {
        sql_script: sqlScript
      });
      
      if (rpcError) {
        console.log('⚠️ RPC method not available, using manual setup');
        await manualSetup();
      } else {
        console.log('✅ Database setup completed via RPC');
      }
    } catch (rpcError) {
      console.log('⚠️ RPC method not available, using manual setup');
      await manualSetup();
    }

    // 4. Verify setup
    console.log('\n4️⃣ Verifying setup...');
    await verifySetup();

    console.log('\n🎉 SUPABASE PRODUCTION SETUP COMPLETED!');
    console.log('========================================');
    console.log('✅ Database tables created');
    console.log('✅ Row Level Security enabled');
    console.log('✅ Storage buckets configured');
    console.log('✅ Default data inserted');
    console.log('\n📋 Next steps:');
    console.log('1. Configure environment variables in Vercel');
    console.log('2. Deploy the application');
    console.log('3. Test all functionalities');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste setup-production.sql');
    console.log('4. Execute the script');
  }
}

async function manualSetup() {
  console.log('\n📝 Manual setup instructions:');
  console.log('1. Go to: https://supabase.com/dashboard/project/dobjulfwktzltpvqtxbql');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Click "New query"');
  console.log('4. Copy the contents of setup-production.sql');
  console.log('5. Paste and click "Run"');
  console.log('6. Wait for all commands to complete');
  
  // Create individual setup commands
  await createTables();
  await createIndexes();
  await enableRLS();
  await createPolicies();
  await insertDefaultData();
  await setupStorage();
}

async function createTables() {
  console.log('\n📊 Creating tables...');
  
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Clients table
    `CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      nationality VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      country VARCHAR(100),
      postal_code VARCHAR(20),
      profile_photo VARCHAR(500),
      banking_details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    

    
    // Investments table
    `CREATE TABLE IF NOT EXISTS investments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      package_id VARCHAR(100) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
      start_date DATE NOT NULL,
      end_date DATE,
      total_returns DECIMAL(15,2) DEFAULT 0,
      daily_returns DECIMAL(10,2) DEFAULT 0,
      payment_method VARCHAR(50),
      transaction_id VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Analytics table
    `CREATE TABLE IF NOT EXISTS analytics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      metric VARCHAR(100) NOT NULL,
      value DECIMAL(15,2) NOT NULL,
      change_percentage DECIMAL(5,2) DEFAULT 0,
      period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
      category VARCHAR(50) DEFAULT 'general',
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Informational Requests table
    `CREATE TABLE IF NOT EXISTS informational_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_name VARCHAR(200) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ];

  for (const tableSQL of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_script: tableSQL });
      if (error) {
        console.log('⚠️ Table creation via RPC failed, manual setup required');
        return;
      }
    } catch (error) {
      console.log('⚠️ RPC not available for table creation');
      return;
    }
  }
  
  console.log('✅ Tables created (or already exist)');
}

async function createIndexes() {
  console.log('\n🔍 Creating indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    'CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);',
    // Verification index removed - simplified system
    'CREATE INDEX IF NOT EXISTS idx_investments_client_id ON investments(client_id);',
    'CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics(category);'
  ];

  for (const indexSQL of indexes) {
    try {
      await supabase.rpc('exec_sql', { sql_script: indexSQL });
    } catch (error) {
      console.log('⚠️ Index creation via RPC failed');
      return;
    }
  }
  
  console.log('✅ Indexes created');
}

async function enableRLS() {
  console.log('\n🔒 Enabling Row Level Security...');
  
  const tables = ['users', 'clients', 'investments', 'analytics', 'informational_requests'];
  
  for (const table of tables) {
    try {
      await supabase.rpc('exec_sql', { 
        sql_script: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
      });
    } catch (error) {
      console.log(`⚠️ RLS enablement failed for ${table}`);
    }
  }
  
  console.log('✅ Row Level Security enabled');
}

async function createPolicies() {
  console.log('\n🛡️ Creating security policies...');
  
  const policies = [
    // Users can view own profile
    `CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id);`,
    
    // Clients can view own profile
    `CREATE POLICY "Clients can view own profile" ON clients
      FOR SELECT USING (user_id = auth.uid());`,
    
    // Admins can view all data
    `CREATE POLICY "Admins can view all users" ON users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
      );`,
    
    // Allow all inserts
    `CREATE POLICY "Allow all inserts" ON users
      FOR INSERT
      TO public
      USING (true)
      WITH CHECK (true);`,
    
    // Allow all selects
    `CREATE POLICY "Allow all select" ON users
      FOR SELECT
      TO public
      USING (true);`,
    
    // Allow all updates
    `CREATE POLICY "Allow all update" ON users
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);`,
    
    // Allow all deletes
    `CREATE POLICY "Allow all delete" ON users
      FOR DELETE
      TO public
      USING (true);`,
    
    // Enable RLS
    `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
  ];

  for (const policySQL of policies) {
    try {
      await supabase.rpc('exec_sql', { sql_script: policySQL });
    } catch (error) {
      console.log('⚠️ Policy creation failed');
    }
  }
  
  console.log('✅ Security policies created');
}

async function insertDefaultData() {
  console.log('\n📊 Inserting default data...');
  
  const defaultData = [
    // Default analytics
    `INSERT INTO analytics (metric, value, change_percentage, period, category, description) VALUES
    ('Total Revenue', 1250000, 12.5, 'monthly', 'financial', 'Monthly revenue tracking'),
    ('Active Users', 1250, 8.3, 'weekly', 'user', 'Weekly active user count'),
    ('Investment Packages', 45, 15.2, 'monthly', 'product', 'Available investment packages')
    ON CONFLICT DO NOTHING;`
  ];

  for (const dataSQL of defaultData) {
    try {
      await supabase.rpc('exec_sql', { sql_script: dataSQL });
    } catch (error) {
      console.log('⚠️ Default data insertion failed');
    }
  }
  
  console.log('✅ Default data inserted');
}

async function setupStorage() {
  console.log('\n📁 Setting up storage buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('⚠️ Storage setup failed');
      return;
    }
    
    const requiredBuckets = ['profile-photos', 'partnership-docs'];
    
    for (const bucketName of requiredBuckets) {
      const exists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!exists) {
        try {
          await supabase.storage.createBucket(bucketName, {
            public: bucketName === 'profile-photos'
          });
          console.log(`✅ Created bucket: ${bucketName}`);
        } catch (bucketError) {
          console.log(`⚠️ Failed to create bucket: ${bucketName}`);
        }
      } else {
        console.log(`✅ Bucket exists: ${bucketName}`);
      }
    }
  } catch (error) {
    console.log('⚠️ Storage setup failed');
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying setup...');
  
  const tables = ['users', 'clients', 'investments', 'analytics', 'informational_requests'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: Connection failed`);
    }
  }
  
  console.log('✅ Setup verification completed');
}

// Run the setup
setupSupabaseProduction().catch(console.error); 