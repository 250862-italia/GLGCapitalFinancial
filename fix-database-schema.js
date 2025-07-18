const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // Read the SQL script
    const fs = require('fs');
    const sqlScript = fs.readFileSync('fix-database-schema.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            console.log(`⚠️ Statement ${i + 1} warning:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} error:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Database schema fix completed!');
    
    // Verify the tables exist
    console.log('\n🔍 Verifying tables...');
    
    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table is accessible');
    }
    
    const { data: clientsCheck, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Clients table error:', clientsError.message);
    } else {
      console.log('✅ Clients table is accessible');
    }
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
fixDatabaseSchema(); 