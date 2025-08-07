require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createInvestmentsTable() {
  try {
    console.log('🔧 Creating investments table...');
    
    // First, let's check if the table exists and what structure it has
    const { data: existingTable, error: tableError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table does not exist or has issues:', tableError);
    } else {
      console.log('✅ Table exists, checking structure...');
    }
    
    // Try to create a simple investment record to test
    const { data: testInvestment, error: insertError } = await supabase
      .from('investments')
      .insert({
        user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
        package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
        amount: 5000.00,
        status: 'pending_payment'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Error creating test investment:', insertError);
      
      // If the error is about missing columns, let's try to create a minimal record
      if (insertError.message.includes('start_date')) {
        console.log('🔧 Trying to create investment without problematic columns...');
        
        const { data: minimalInvestment, error: minimalError } = await supabase
          .from('investments')
          .insert({
            user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
            package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
            amount: 5000.00,
            status: 'pending_payment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (minimalError) {
          console.log('❌ Still error with minimal investment:', minimalError);
        } else {
          console.log('✅ Minimal investment created:', minimalInvestment);
        }
      }
    } else {
      console.log('✅ Test investment created successfully:', testInvestment);
    }
    
    // Check what columns actually exist
    console.log('🔍 Checking table structure...');
    const { data: structure, error: structureError } = await supabase
      .from('investments')
      .select('*')
      .limit(0);
    
    if (structureError) {
      console.log('❌ Error checking structure:', structureError);
    } else {
      console.log('✅ Table structure check completed');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createInvestmentsTable(); 