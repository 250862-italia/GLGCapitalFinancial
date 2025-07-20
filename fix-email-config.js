const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailSystem() {
  try {
    console.log('🔧 Testing email system...');
    
    // Test 1: Insert email into queue
    console.log('📧 Test 1: Inserting test email into queue...');
    const { data: emailData, error: insertError } = await supabase
      .from('email_queue')
      .insert({
        to_email: 'test@example.com',
        from_email: 'noreply@glgcapitalgroupllc.com',
        subject: 'Test Email System - GLG Capital Group',
        html_content: '<h1>Test Email</h1><p>This is a test email to verify the system is working.</p>',
        text_content: 'Test Email\n\nThis is a test email to verify the system is working.',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting test email:', insertError);
      return;
    }

    console.log('✅ Test email inserted:', emailData.id);
    
    // Test 2: Process email queue
    console.log('📧 Test 2: Processing email queue...');
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending');

    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError);
      return;
    }

    console.log(`📊 Found ${pendingEmails.length} pending emails`);
    
    // Test 3: Update status to sent (simulate sending)
    for (const email of pendingEmails) {
      const { error: updateError } = await supabase
        .from('email_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', email.id);

      if (updateError) {
        console.error(`❌ Error updating email ${email.id}:`, updateError);
      } else {
        console.log(`✅ Email ${email.id} marked as sent`);
      }
    }
    
    console.log('✅ Email system test completed successfully');
    
  } catch (error) {
    console.error('❌ Email system test failed:', error);
  }
}

testEmailSystem(); 