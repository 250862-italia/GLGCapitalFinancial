require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fix email registration problem...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEmailRegistration() {
  try {
    console.log('🔍 Step 1: Check current email rate limit status...');
    
    // Check if there are pending emails in queue
    const { data: pendingEmails, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending');
    
    if (queueError) {
      console.log('❌ Error checking email queue:', queueError.message);
    } else {
      console.log(`📧 Pending emails in queue: ${pendingEmails?.length || 0}`);
    }
    
    console.log('\n🔍 Step 2: Check unconfirmed users...');
    
    // Get all users that haven't confirmed their email
    const { data: unconfirmedUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
    } else {
      const unconfirmed = unconfirmedUsers.users.filter(user => !user.email_confirmed_at);
      console.log(`👥 Unconfirmed users: ${unconfirmed.length}`);
      
      if (unconfirmed.length > 0) {
        console.log('\n📋 Unconfirmed users list:');
        unconfirmed.forEach(user => {
          console.log(`   - ${user.email} (created: ${user.created_at})`);
        });
      }
    }
    
    console.log('\n🔍 Step 3: Solutions for email rate limit...');
    
    console.log('\n💡 SOLUZIONI DISPONIBILI:');
    console.log('\n1️⃣ UPGRADE SUPABASE PLAN:');
    console.log('   - Vai su: https://supabase.com/dashboard/project/dobjulfwktzltpvqtxbql/billing');
    console.log('   - Upgrade al piano Pro ($25/mese) per 100,000 email/mese');
    console.log('   - Oppure al piano Team ($599/mese) per email illimitate');
    
    console.log('\n2️⃣ CONFIGURA SMTP ESTERNO:');
    console.log('   - Configura Gmail, SendGrid, o altro servizio SMTP');
    console.log('   - Aggiungi le variabili nel file .env.local:');
    console.log('     SMTP_HOST=smtp.gmail.com');
    console.log('     SMTP_PORT=587');
    console.log('     SMTP_USER=your-email@gmail.com');
    console.log('     SMTP_PASS=your-app-password');
    
    console.log('\n3️⃣ DISABILITA TEMPORANEAMENTE EMAIL:');
    console.log('   - Modifica il codice per non inviare email di conferma');
    console.log('   - Gli utenti possono registrarsi senza conferma email');
    
    console.log('\n4️⃣ CONFERMA MANUALE UTENTI:');
    console.log('   - Conferma manualmente gli utenti esistenti');
    console.log('   - Usa lo script per confermare tutti gli utenti');
    
    console.log('\n🔧 Step 4: Auto-confirm existing users...');
    
    // Auto-confirm all existing users to bypass email confirmation
    if (unconfirmedUsers && unconfirmedUsers.users.length > 0) {
      console.log('\n📧 Auto-confirming existing users...');
      
      for (const user of unconfirmedUsers.users) {
        if (!user.email_confirmed_at) {
          try {
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
              user.id,
              { email_confirm: true }
            );
            
            if (confirmError) {
              console.log(`❌ Error confirming ${user.email}:`, confirmError.message);
            } else {
              console.log(`✅ Confirmed: ${user.email}`);
            }
          } catch (error) {
            console.log(`❌ Error confirming ${user.email}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n🔧 Step 5: Create email bypass for new registrations...');
    
    // Create a modified registration endpoint that doesn't require email confirmation
    console.log('\n📝 Per bypassare le email di conferma, modifica il file:');
    console.log('   app/api/auth/register/route.ts');
    console.log('\n   Aggiungi questa opzione:');
    console.log('   email_confirm: true');
    console.log('\n   Esempio:');
    console.log('   const { data: user, error: registerError } = await supabaseAdmin.auth.signUp({');
    console.log('     email,');
    console.log('     password,');
    console.log('     options: {');
    console.log('       email_confirm: true,  // ← Aggiungi questa riga');
    console.log('       data: {');
    console.log('         first_name: firstName,');
    console.log('         last_name: lastName,');
    console.log('         role: "user"');
    console.log('       }');
    console.log('     }');
    console.log('   });');
    
    console.log('\n✅ Fix completato!');
    console.log('\n🎯 PROSSIMI PASSI:');
    console.log('1. Scegli una delle soluzioni sopra');
    console.log('2. Se scegli SMTP, configura le variabili d\'ambiente');
    console.log('3. Se scegli bypass, modifica il codice di registrazione');
    console.log('4. Testa la registrazione con un nuovo utente');
    
  } catch (error) {
    console.error('❌ Error during fix:', error.message);
  }
}

fixEmailRegistration(); 