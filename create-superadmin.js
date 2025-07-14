// Script per creare un superadmin in Supabase Auth
// Requisiti: npm install @supabase/supabase-js dotenv

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createSuperAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'info@washtw.com',
    password: 'Nncgnn62*',
    email_confirm: true,
    user_metadata: { role: 'superadmin' }
  });
  if (error) {
    console.error('❌ Errore creazione superadmin:', error.message);
  } else {
    console.log('✅ Superadmin creato con successo:', data.user.email);
  }
}

createSuperAdmin(); 