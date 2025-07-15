require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function cleanEmailQueue() {
  try {
    console.log('🧹 Cleaning email queue...');
    
    // Delete all emails with error status or test emails
    const { data, error } = await supabaseAdmin
      .from('email_queue')
      .delete()
      .or('status.eq.error,to_email.like.%example.com%,to_email.like.%test%');
    
    if (error) {
      console.error('❌ Error cleaning email queue:', error.message);
      return false;
    }
    
    console.log('✅ Email queue cleaned successfully');
    console.log('🗑️ Deleted emails:', data?.length || 0);
    
    // Check remaining emails
    const { data: remainingEmails, error: checkError } = await supabaseAdmin
      .from('email_queue')
      .select('*');
    
    if (checkError) {
      console.error('❌ Error checking remaining emails:', checkError.message);
      return false;
    }
    
    console.log('📧 Remaining emails in queue:', remainingEmails?.length || 0);
    
    if (remainingEmails && remainingEmails.length > 0) {
      console.log('📋 Remaining emails:');
      remainingEmails.forEach(email => {
        console.log(`  - ${email.to_email} (${email.status})`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during email queue cleanup:', error.message);
    return false;
  }
}

cleanEmailQueue().then(success => {
  if (success) {
    console.log('\n🎉 Email queue cleanup completed successfully!');
    console.log('💡 You can now try the registration test again.');
  } else {
    console.log('\n❌ Email queue cleanup failed.');
  }
  process.exit(success ? 0 : 1);
}); 