require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('Service Role Key:', serviceRoleKey ? '✅ Present' : '❌ Missing');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Basic connection...');
    const { data: healthData, error: healthError } = await supabase.from('clients').select('count').limit(1);
    
    if (healthError) {
      console.log('❌ Connection error:', healthError.message);
      console.log('Error code:', healthError.code);
      console.log('Error details:', healthError.details);
    } else {
      console.log('✅ Connection successful');
    }
    
    // Test 2: RLS policies
    console.log('\n🔐 Test 2: RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('clients')
      .select('id, user_id, email, first_name')
      .limit(5);
    
    if (rlsError) {
      console.log('❌ RLS error:', rlsError.message);
      console.log('Error code:', rlsError.code);
      if (rlsError.code === 'PGRST116') {
        console.log('⚠️ This might be a RLS policy issue');
      }
    } else {
      console.log('✅ RLS policies working');
      console.log('Data count:', rlsData?.length || 0);
    }
    
    // Test 3: Auth check
    console.log('\n🔑 Test 3: Auth check...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth working');
      console.log('User:', user ? 'Present' : 'None');
    }
    
    // Test 4: Specific table access
    console.log('\n📊 Test 4: Table access...');
    const tables = ['clients', 'profiles', 'investments', 'packages'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ ${table}:`, error.message, `(${error.code})`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (e) {
        console.log(`❌ ${table}:`, e.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testSupabaseConnection().catch(console.error); 