require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testEmailWithExistingUser() {
  try {
    console.log('🧪 Testing email system with existing user...');
    
    // Use an existing user email
    const testEmail = 'testuser1@glgcapitalgroupllc.com';
    const firstName = 'Test';
    const lastName = 'User';
    
    console.log(`📧 Testing with user: ${testEmail}`);
    
    // Test email service directly
    const { emailService } = await import('./lib/email-service.ts');
    
    const result = await emailService.sendWelcomeEmail(testEmail, firstName, lastName);
    
    if (result) {
      console.log('✅ Welcome email sent successfully');
    } else {
      console.log('❌ Welcome email failed');
    }
    
    // Check email queue
    const { data: emails, error } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking email queue:', error.message);
      return false;
    }
    
    if (emails && emails.length > 0) {
      console.log('📧 Latest email in queue:');
      console.log(`  To: ${emails[0].to_email}`);
      console.log(`  Subject: ${emails[0].subject}`);
      console.log(`  Status: ${emails[0].status}`);
      console.log(`  Created: ${emails[0].created_at}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testEmailWithExistingUser().then(success => {
  if (success) {
    console.log('\n🎉 Email test completed successfully!');
  } else {
    console.log('\n❌ Email test failed.');
  }
  process.exit(success ? 0 : 1);
}); 