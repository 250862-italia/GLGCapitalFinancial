// Script per inserire una email di test nella email_queue di Supabase
// Requisiti: npm install @supabase/supabase-js dotenv

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTestEmail() {
  const to_email = process.env.TEST_EMAIL_TO || 'corefound@glgcapitalgroupllc.com';
  const from_email = 'noreply@glgcapitalgroupllc.com';
  const subject = 'Test automatico email queue';
  const html_content = '<b>Questa è una email di test inviata dalla coda Supabase!</b>';
  const text_content = 'Questa è una email di test inviata dalla coda Supabase!';

  const { data, error } = await supabase
  .from('email_queue')
  .insert([
    {
      to_email,
      subject,
      html_content,
      text_content,
      from_email,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ])
    .select();

  if (error) {
    console.error('Errore inserimento email di test:', error.message);
  } else {
    console.log('✅ Email di test inserita in coda per', to_email);
  }
}

sendTestEmail(); 