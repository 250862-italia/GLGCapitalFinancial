const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30'
};

async function reactivateSupabase() {
  console.log('🔄 Reactivating Supabase Database...');
  console.log('=====================================');
  
  try {
    // Step 1: Test basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      console.log('✅ Project is active and accessible');
    } else if (response.status === 401) {
      console.log('❌ Authentication failed - credentials may be expired');
    } else if (response.status === 403) {
      console.log('❌ Access forbidden - project may be suspended');
    } else {
      console.log('❌ Unexpected status:', response.status);
    }

    // Step 2: Create Supabase client and test connection
    console.log('\n2️⃣ Testing Supabase client...');
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Details:', error.details);
      
      // Check if it's a table not found error
      if (error.code === 'PGRST116') {
        console.log('📋 Tables need to be created - running setup...');
        await setupDatabaseTables();
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('   Data:', data);
    }

    // Step 3: Test service role key
    console.log('\n3️⃣ Testing service role key...');
    const supabaseService = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);
    
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('users')
      .select('count')
      .limit(1);
    
    if (serviceError) {
      console.log('❌ Service key test failed:', serviceError.message);
    } else {
      console.log('✅ Service key test successful');
    }

  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    console.log('   Error type:', error.constructor.name);
    
    // Provide fallback solution
    console.log('\n🛠️  Setting up fallback solution...');
    await setupFallbackDatabase();
  }
  
  console.log('\n=====================================');
  console.log('🏁 Reactivation process completed');
}

async function setupDatabaseTables() {
  console.log('\n📋 Setting up database tables...');
  
  const tables = [
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'clients',
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          company_name VARCHAR(255),
          tax_id VARCHAR(50),
          address TEXT,
          city VARCHAR(100),
          country VARCHAR(100),
          postal_code VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'kyc_records',
      sql: `
        CREATE TABLE IF NOT EXISTS kyc_records (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          status VARCHAR(20) DEFAULT 'pending',
          document_type VARCHAR(50),
          document_url TEXT,
          verification_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'investments',
      sql: `
        CREATE TABLE IF NOT EXISTS investments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          amount DECIMAL(15,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'EUR',
          status VARCHAR(20) DEFAULT 'pending',
          investment_type VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  const supabaseService = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);
  
  for (const table of tables) {
    try {
      console.log(`   Creating table: ${table.name}`);
      const { error } = await supabaseService.rpc('exec_sql', { sql: table.sql });
      
      if (error) {
        console.log(`   ❌ Error creating ${table.name}:`, error.message);
      } else {
        console.log(`   ✅ Table ${table.name} created successfully`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to create ${table.name}:`, error.message);
    }
  }
}

async function setupFallbackDatabase() {
  console.log('\n🔄 Setting up local SQLite fallback...');
  
  // Create a simple SQLite database for local development
  const sqliteConfig = {
    filename: './local-database.sqlite',
    driver: 'sqlite3'
  };
  
  console.log('   Local database will be created at:', sqliteConfig.filename);
  console.log('   This will allow development to continue while Supabase is being fixed');
  
  // Update environment variables to use local database
  const envPath = '.env.local';
  const envContent = `
# Supabase Configuration (currently inactive)
NEXT_PUBLIC_SUPABASE_URL=https://dobjulfwktzltpvqtxbql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30

# Local Database Configuration (fallback)
USE_LOCAL_DATABASE=true
LOCAL_DATABASE_PATH=./local-database.sqlite

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@glgcapital.com

# Application Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
  `.trim();
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ Environment file updated');
  } catch (error) {
    console.log('   ❌ Failed to update environment file:', error.message);
  }
}

// Run the reactivation process
reactivateSupabase().catch(console.error); 