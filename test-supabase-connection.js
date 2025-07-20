require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Check environment variables
    console.log('📋 Environment variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Missing required environment variables');
      return;
    }
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔧 Testing connection to profiles table...');
    
    // Test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('🔍 Error details:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Data:', data);
    
    // Test admin profile
    console.log('🔍 Looking for admin profile...');
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@glgcapitalgroupllc.com')
      .single();
    
    if (adminError) {
      console.log('❌ Error finding admin profile:', adminError.message);
    } else if (adminProfile) {
      console.log('✅ Admin profile found:', adminProfile);
    } else {
      console.log('❌ Admin profile not found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSupabaseConnection(); 