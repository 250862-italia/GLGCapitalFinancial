const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotesTable() {
  try {
    console.log('📝 Creating notes table...');
    
    const fs = require('fs');
    const sql = fs.readFileSync('create-notes-table.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error('❌ Error executing statement:', error);
          console.error('Statement:', statement);
        }
      }
    }
    
    console.log('✅ Notes table creation completed');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createNotesTable(); 