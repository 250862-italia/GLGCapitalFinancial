const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExistingTable() {
  try {
    console.log('🔍 Checking existing informational_requests table...');
    
    // Try to get one record to see the structure
    const { data, error } = await supabase
      .from('informational_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing table:', error.message);
      
      // Try to create the table
      console.log('📝 Attempting to create table...');
      const { error: createError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS informational_requests (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                country VARCHAR(100),
                city VARCHAR(100),
                additional_notes TEXT,
                status VARCHAR(50) DEFAULT 'PENDING',
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
      } else {
        console.log('✅ Table created successfully');
      }
      
      return;
    }
    
    console.log('✅ Table exists');
    if (data && data.length > 0) {
      console.log('📊 Sample record structure:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('📊 Table is empty');
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
}

checkExistingTable(); 