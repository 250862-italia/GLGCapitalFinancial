const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createClientsTable() {
  try {
    console.log('📝 Creating clients table using REST API...');
    
    // First, let's check if the table already exists
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('Table does not exist, creating it...');
      
      // Try to insert a test client - this will create the table if it doesn't exist
      const { data: insertData, error: insertError } = await supabase
        .from('clients')
        .insert([
          {
            first_name: 'Test',
            last_name: 'Client',
            email: 'test@example.com',
            phone: '+1-555-0123',
            country: 'United States',
            city: 'New York',
            status: 'active',
            kyc_status: 'verified'
          }
        ])
        .select();
      
      if (insertError) {
        console.error('❌ Error creating table:', insertError);
        return false;
      }
      
      console.log('✅ Clients table created successfully');
      
      // Now let's insert some sample data
      const sampleClients = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          country: 'United States',
          city: 'New York',
          status: 'active',
          kyc_status: 'verified'
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0456',
          country: 'Canada',
          city: 'Toronto',
          status: 'active',
          kyc_status: 'verified'
        },
        {
          first_name: 'Marco',
          last_name: 'Rossi',
          email: 'marco.rossi@example.com',
          phone: '+39-333-123456',
          country: 'Italy',
          city: 'Milan',
          status: 'pending',
          kyc_status: 'pending'
        }
      ];
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('clients')
        .insert(sampleClients)
        .select();
      
      if (sampleError) {
        console.error('❌ Error inserting sample data:', sampleError);
      } else {
        console.log('✅ Sample data inserted successfully');
      }
      
      return true;
    } else if (testError) {
      console.error('❌ Unexpected error:', testError);
      return false;
    } else {
      console.log('✅ Clients table already exists and is accessible');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createClientsTable(); 