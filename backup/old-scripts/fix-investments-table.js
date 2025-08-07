require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixInvestmentsTable() {
  try {
    console.log('🔧 Fixing investments table...');
    
    // Check current table structure
    console.log('📋 Checking current table structure...');
    const { data: currentStructure, error: structureError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.log('❌ Error checking table structure:', structureError);
      return;
    }
    
    console.log('✅ Table structure check completed');
    
    // Add missing columns if they don't exist
    console.log('🔧 Adding missing columns...');
    
    // Try to add start_date column
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE investments 
          ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS daily_return DECIMAL(5,2) DEFAULT 0,
          ADD COLUMN IF NOT EXISTS total_return DECIMAL(10,2) DEFAULT 0,
          ADD COLUMN IF NOT EXISTS last_payout_date TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS next_payout_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day')
        `
      });
      
      if (alterError) {
        console.log('⚠️ Error adding columns (might already exist):', alterError);
      } else {
        console.log('✅ Columns added successfully');
      }
    } catch (error) {
      console.log('⚠️ RPC not available, trying direct SQL...');
      
      // Alternative: Create a new investment with proper structure
      const { data: newInvestment, error: insertError } = await supabase
        .from('investments')
        .insert({
          user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
          package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
          amount: 5000,
          status: 'pending_payment',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.log('❌ Error creating test investment:', insertError);
      } else {
        console.log('✅ Test investment created:', newInvestment);
      }
    }
    
    // Check if the investment was created
    console.log('🔍 Checking for recent investments...');
    const { data: investments, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.log('❌ Error fetching investments:', fetchError);
    } else {
      console.log('📊 Recent investments:', investments);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixInvestmentsTable(); 