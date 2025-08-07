#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('🔍 Verifica Utenti nel Database Supabase');
  console.log('========================================\n');

  try {
    // Verifica utenti auth
    console.log('📋 Utenti Auth:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Errore nel recupero utenti auth:', authError.message);
    } else {
      console.log(`✅ ${authUsers.users.length} utenti trovati:`);
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id}) - ${user.email_confirmed_at ? 'Verificato' : 'Non verificato'}`);
      });
    }

    console.log('\n📋 Profili Utenti:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.log('❌ Errore nel recupero profili:', profileError.message);
    } else {
      console.log(`✅ ${profiles.length} profili trovati:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.name} (${profile.email}) - Ruolo: ${profile.role}`);
      });
    }

    console.log('\n📋 Clienti:');
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*');

    if (clientError) {
      console.log('❌ Errore nel recupero clienti:', clientError.message);
    } else {
      console.log(`✅ ${clients.length} clienti trovati:`);
      clients.forEach(client => {
        console.log(`   - ${client.first_name} ${client.last_name} (${client.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

checkUsers(); 