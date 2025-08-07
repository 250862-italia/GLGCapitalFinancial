// Script per verificare e creare l'admin nella tabella profiles
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.log('Assicurati che .env.local contenga:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAndCreateAdminProfile() {
  console.log('🔧 Verifica e creazione admin nella tabella profiles...');
  
  const adminEmail = 'admin@glgcapital.com';
  
  try {
    // 1. Verifica se l'admin esiste nella tabella profiles
    console.log('\n1️⃣ Verificando se l\'admin esiste nella tabella profiles...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Errore verifica profilo:', profileError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Admin trovato nella tabella profiles');
      console.log('   - ID:', existingProfile.id);
      console.log('   - Email:', existingProfile.email);
      console.log('   - Role:', existingProfile.role);
      console.log('   - Nome:', existingProfile.first_name, existingProfile.last_name);
      return;
    }

    console.log('❌ Admin non trovato nella tabella profiles');

    // 2. Ottieni l'utente da Supabase Auth
    console.log('\n2️⃣ Ottenendo utente da Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Errore ottenimento utenti Auth:', authError);
      return;
    }

    const adminUser = authUsers.users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.log('❌ Admin non trovato in Supabase Auth');
      console.log('   Creazione admin completo...');
      
      // Crea l'utente in Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'Admin123!',
        email_confirm: true
      });

      if (createError) {
        console.error('❌ Errore creazione utente Auth:', createError);
        return;
      }

      console.log('✅ Utente creato in Auth:', newUser.user.id);
      
      // Crea il profilo
      const { data: newProfile, error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'GLG Capital',
          role: 'superadmin',
          is_active: true,
          email_verified: true
        })
        .select()
        .single();

      if (profileCreateError) {
        console.error('❌ Errore creazione profilo:', profileCreateError);
        return;
      }

      console.log('✅ Profilo creato:', newProfile.id);
      return;
    }

    console.log('✅ Admin trovato in Auth:', adminUser.id);

    // 3. Crea il profilo nella tabella profiles
    console.log('\n3️⃣ Creando profilo nella tabella profiles...');
    const { data: newProfile, error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: adminUser.id,
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'GLG Capital',
        role: 'superadmin',
        is_active: true,
        email_verified: true
      })
      .select()
      .single();

    if (profileCreateError) {
      if (profileCreateError.code === '23505') { // Duplicate key
        console.log('⚠️  Profilo già esistente (duplicate key)');
        
        // Aggiorna il profilo esistente
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'superadmin',
            is_active: true,
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Errore aggiornamento profilo:', updateError);
          return;
        }

        console.log('✅ Profilo aggiornato:', updatedProfile.id);
      } else {
        console.error('❌ Errore creazione profilo:', profileCreateError);
        return;
      }
    } else {
      console.log('✅ Profilo creato:', newProfile.id);
    }

    console.log('\n🎉 Admin configurato correttamente!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: superadmin');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

checkAndCreateAdminProfile(); 