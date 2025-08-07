require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('🔍 Checking available tables...');
    
    // Try common table names
    const tableNames = ['profiles', 'clients', 'investments', 'packages', 'notifications', 'users'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName}: exists`);
        }
      } catch (e) {
        console.log(`❌ Table ${tableName}: ${e.message}`);
      }
    }
    
    // Try to get table list using RPC
    try {
      const { data: tables, error } = await supabase
        .rpc('get_tables');
      
      if (error) {
        console.log('❌ RPC get_tables failed:', error.message);
      } else {
        console.log('📋 Tables via RPC:', tables);
      }
    } catch (e) {
      console.log('❌ RPC call failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTables(); 