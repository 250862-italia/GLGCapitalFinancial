const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function recreateTable() {
  try {
    console.log('🔧 Recreating informational_requests table...');
    
    // Drop existing table if it exists
    console.log('🗑️ Dropping existing table...');
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS informational_requests CASCADE;'
      });
    
    if (dropError) {
      console.log('⚠️ Could not drop table (might not exist):', dropError.message);
    } else {
      console.log('✅ Existing table dropped');
    }
    
    // Create new table with correct structure
    console.log('📝 Creating new table...');
    const createSQL = `
      CREATE TABLE informational_requests (
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
    `;
    
    const { error: createError } = await supabase
      .rpc('exec_sql', { sql: createSQL });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ Table created successfully');
    
    // Test insert
    console.log('🧪 Testing insert...');
    const { data, error: insertError } = await supabase
      .from('informational_requests')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '123456789',
        country: 'Italy',
        city: 'Rome',
        additional_notes: 'Test request',
        status: 'PENDING'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
    } else {
      console.log('✅ Test insert successful:', data.id);
      
      // Clean up
      await supabase.from('informational_requests').delete().eq('id', data.id);
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error recreating table:', error);
  }
}

recreateTable(); 