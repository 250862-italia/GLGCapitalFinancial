require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCSRFTokensTable() {
  console.log('🔧 Creating CSRF tokens table...');
  
  try {
    // Create the table using a direct query
    console.log('📝 Creating csrf_tokens table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS csrf_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used BOOLEAN DEFAULT FALSE,
        use_count INTEGER DEFAULT 0
      );
    `;
    
    // Try to create the table using a raw query
    const { error: createError } = await supabase
      .from('csrf_tokens')
      .select('*')
      .limit(1);
    
    if (createError && createError.message.includes('does not exist')) {
      console.log('⚠️ Table does not exist, you need to create it manually in Supabase SQL Editor');
      console.log('💡 Please run this SQL in Supabase SQL Editor:');
      console.log('\n' + createTableQuery);
      return;
    }
    
    // Create indexes
    console.log('📝 Creating indexes...');
    
    // Insert a test token
    console.log('📝 Inserting test token...');
    const testToken = 'test-csrf-token-' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('csrf_tokens')
      .insert({
        token: testToken,
        created_at: new Date().toISOString(),
        used: false,
        use_count: 0
      })
      .select();
    
    if (insertError) {
      console.log('❌ Error inserting test token:', insertError.message);
    } else {
      console.log('✅ Test token inserted successfully');
    }
    
    // Verify the table
    const { data: verifyData, error: verifyError } = await supabase
      .from('csrf_tokens')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.log('⚠️ Table verification failed:', verifyError.message);
    } else {
      console.log('✅ CSRF tokens table verified successfully');
      console.log(`📊 Found ${verifyData.length} tokens in table`);
    }
    
  } catch (error) {
    console.error('❌ Error creating CSRF tokens table:', error.message);
    console.log('\n💡 Please run the create-csrf-tokens-table.sql script manually in Supabase SQL Editor');
  }
}

// Run the script
createCSRFTokensTable(); 