require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCSRFTokensTable() {
  console.log('🔧 Creating CSRF tokens table...');
  
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync('create-csrf-tokens-table.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.log(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 CSRF tokens table creation completed!');
    
    // Verify the table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('csrf_tokens')
      .select('count')
      .limit(1);
    
    if (verifyError) {
      console.log('⚠️ Table verification failed:', verifyError.message);
      console.log('💡 You may need to run the SQL script manually in Supabase SQL Editor');
    } else {
      console.log('✅ CSRF tokens table verified successfully');
    }
    
  } catch (error) {
    console.error('❌ Error creating CSRF tokens table:', error.message);
    console.log('\n💡 Please run the create-csrf-tokens-table.sql script manually in Supabase SQL Editor');
  }
}

// Run the script
createCSRFTokensTable(); 