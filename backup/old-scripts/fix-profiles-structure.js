require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixProfilesStructure() {
  console.log('🔧 Fixing profiles table structure...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Check current structure
    console.log('\n📊 Current profiles structure:');
    const { data: currentProfiles, error: currentError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.log('❌ Error checking current structure:', currentError.message);
      return;
    }
    
    if (currentProfiles && currentProfiles.length > 0) {
      console.log('Current columns:', Object.keys(currentProfiles[0]));
    }
    
    // Check if user_id column exists
    console.log('\n🔍 Checking for user_id column...');
    try {
      const { data: testQuery, error: testError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);
      
      if (testError && testError.message.includes('user_id')) {
        console.log('❌ user_id column does not exist');
        console.log('Adding user_id column...');
        
        // Add user_id column
        const { error: alterError } = await supabase.rpc('add_user_id_to_profiles');
        
        if (alterError) {
          console.log('❌ Error adding user_id column:', alterError.message);
          console.log('Trying alternative approach...');
          
          // Alternative: Create a new profiles table with correct structure
          console.log('Creating new profiles table with correct structure...');
          
          const { error: createError } = await supabase.rpc('create_profiles_table_fixed');
          
          if (createError) {
            console.log('❌ Error creating new table:', createError.message);
          } else {
            console.log('✅ New profiles table created');
          }
        } else {
          console.log('✅ user_id column added successfully');
        }
      } else {
        console.log('✅ user_id column already exists');
      }
    } catch (e) {
      console.log('❌ Error testing user_id column:', e.message);
    }
    
    // Test the fix
    console.log('\n🧪 Testing the fix...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name')
        .limit(1);
      
      if (testError) {
        console.log('❌ Test failed:', testError.message);
      } else {
        console.log('✅ Test successful - profiles table now has correct structure');
      }
    } catch (e) {
      console.log('❌ Test exception:', e.message);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

fixProfilesStructure().catch(console.error); 