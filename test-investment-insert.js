require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInvestmentInsert() {
  try {
    console.log('🧪 Testing investment insertion...');
    
    // Test with all possible required fields
    const { data: investment, error } = await supabase
      .from('investments')
      .insert({
        user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
        package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
        amount: 5000.00,
        status: 'pending_payment',
        expected_return: 1.8,
        daily_return: 1.8,
        total_return: 0.00,
        daily_returns: 0.00,
        total_returns: 0.00,
        notes: 'Test investment for GLG Balanced Growth package',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.log('❌ Error creating investment:', error);
      
      // Try to get more details about the table structure
      console.log('🔍 Getting table structure...');
      const { data: columns, error: columnError } = await supabase
        .from('investments')
        .select('*')
        .limit(0);
      
      if (columnError) {
        console.log('❌ Error getting table structure:', columnError);
      } else {
        console.log('✅ Table structure retrieved');
      }
      
    } else {
      console.log('✅ Investment created successfully:', investment);
      
      // Now test the admin API to see if it can fetch this investment
      console.log('🔍 Testing admin API...');
      const adminResponse = await fetch('http://localhost:3000/api/admin/investments', {
        headers: {
          'x-admin-session': 'admin_95971e18-ff4f-40e6-9aae-5e273671d20b_1752993002055_9u3pzy86j'
        }
      });
      
      const adminData = await adminResponse.json();
      console.log('📊 Admin API response:', adminData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testInvestmentInsert(); 