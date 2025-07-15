require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧹 Pulizia coda email...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanEmailQueue() {
  try {
    console.log('🔍 Step 1: Check pending emails...');
    
    // Get all pending emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError.message);
      return;
    }
    
    console.log(`📧 Found ${pendingEmails?.length || 0} pending emails`);
    
    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to clean');
      return;
    }
    
    console.log('\n📋 Pending emails:');
    pendingEmails.forEach(email => {
      console.log(`   - ${email.to_email}: ${email.subject} (${email.created_at})`);
    });
    
    console.log('\n🔧 Step 2: Mark emails as error...');
    
    // Mark all pending emails as error to clear the queue
    const { error: updateError } = await supabase
      .from('email_queue')
      .update({ 
        status: 'error',
        error_message: 'Processed manually - rate limit bypass'
      })
      .eq('status', 'pending');
    
    if (updateError) {
      console.error('❌ Error updating emails:', updateError.message);
      return;
    }
    
    console.log('✅ All pending emails marked as error');
    
    console.log('\n🔍 Step 3: Verify cleanup...');
    
    // Verify no pending emails remain
    const { data: remainingEmails, error: verifyError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending');
    
    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError.message);
    } else {
      console.log(`✅ Remaining pending emails: ${remainingEmails?.length || 0}`);
    }
    
    console.log('\n🎯 Email queue cleaned successfully!');
    console.log('\n📝 Note:');
    console.log('- Registration now works without email confirmation');
    console.log('- Users can register and login immediately');
    console.log('- No more rate limit issues');
    console.log('- Consider upgrading Supabase plan for production');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

cleanEmailQueue(); 