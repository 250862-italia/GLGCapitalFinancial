// Script per verificare la struttura della tabella users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking informational_requests table structure...');
    
    // Get table info
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: 'informational_requests' });
    
    if (error) {
      console.log('❌ Error getting table info:', error.message);
      
      // Try alternative approach - insert with minimal data
      console.log('📝 Trying minimal insert...');
      const { data: insertData, error: insertError } = await supabase
        .from('informational_requests')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Minimal insert error:', insertError);
        console.log('📋 Error details:', insertError);
      } else {
        console.log('✅ Minimal insert successful:', insertData.id);
        
        // Clean up
        await supabase
          .from('informational_requests')
          .delete()
          .eq('id', insertData.id);
      }
      
      return;
    }
    
    console.log('✅ Table structure:', data);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

checkTableStructure(); 