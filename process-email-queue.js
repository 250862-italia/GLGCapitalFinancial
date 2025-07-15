require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function processQueue() {
  console.log('Inizio processazione coda email...');
  // Recupera tutte le email in coda con status 'pending'
  const { data: emails, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error('❌ Errore recupero email dalla coda:', error.message);
    return;
  }
  if (!emails || emails.length === 0) {
    console.log('Nessuna email pending trovata.');
    return;
  }
  console.log('Email in coda trovate:', emails.length);
  for (const email of emails) {
    console.log('---\nDati email:', JSON.stringify(email, null, 2));
    try {
      await transporter.sendMail({
        from: email.from_email,
        to: email.to_email,
        subject: email.subject,
        text: email.text_content,
        html: email.html_content,
      });
      console.log(`✅ Email inviata a ${email.to_email}`);
      // Aggiorna lo status a 'sent'
      const { error: updateError } = await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', email.id);
      if (updateError) {
        console.error('❌ Errore aggiornamento status a sent:', updateError.message);
      } else {
        console.log(`Status aggiornato a sent per ${email.to_email}`);
      }
    } catch (err) {
      console.error(`❌ Errore invio email a ${email.to_email}:`, err.message);
      // Aggiorna lo status a 'error'
      const { error: updateError } = await supabase
        .from('email_queue')
        .update({ status: 'error', error_message: err.message })
        .eq('id', email.id);
      if (updateError) {
        console.error('❌ Errore aggiornamento status a error:', updateError.message);
      } else {
        console.log(`Status aggiornato a error per ${email.to_email}`);
      }
    }
  }
  console.log('Processazione coda email completata.');
}

processQueue(); 