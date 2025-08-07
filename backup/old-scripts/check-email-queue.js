const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmailQueue() {
  try {
    console.log('🔍 Checking email_queue table...');
    
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Email queue table error:', error.message);
      console.log('📋 Error details:', error);
      return false;
    }
    
    console.log('✅ Email queue table exists and is accessible');
    console.log('📊 Current records:', data.length);
    return true;
    
  } catch (error) {
    console.error('❌ Error checking email queue:', error);
    return false;
  }
}

checkEmailQueue(); 