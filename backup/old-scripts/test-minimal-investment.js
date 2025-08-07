require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMinimalInvestment() {
  try {
    console.log('🧪 Testing minimal investment insertion...');
    
    // Test with only essential fields
    const { data: investment, error } = await supabase
      .from('investments')
      .insert({
        user_id: '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
        package_id: '58d1948b-9453-4cfd-93e9-9b763750e478',
        amount: 5000.00,
        status: 'pending_payment',
        expected_return: 1.8
      })
      .select();
    
    if (error) {
      console.log('❌ Error creating investment:', error);
      
      // Let's see what columns actually exist
      console.log('🔍 Checking what columns exist...');
      
      // Try to select all columns to see what's available
      const { data: sample, error: sampleError } = await supabase
        .from('investments')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Error getting sample:', sampleError);
      } else {
        console.log('✅ Sample data retrieved, columns exist');
      }
      
    } else {
      console.log('✅ Investment created successfully:', investment);
      
      // Test admin API
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

testMinimalInvestment(); 