require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Email da NON eliminare (admin/superadmin)
const keepEmails = [
  'superadmin1@glgcapitalgroupllc.com',
  'corefound@glgcapitalgroupllc.com',
  'innocentigianni@icloud.com',
  'info@washtw.com'
];

async function deleteTestUsers() {
  try {
    console.log('🧹 Deleting test users from Supabase Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error listing auth users:', authError.message);
      return false;
    }
    let deleted = 0;
    for (const user of authUsers.users) {
      if (!keepEmails.includes(user.email)) {
        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (delError) {
          console.error(`❌ Error deleting user ${user.email}:`, delError.message);
        } else {
          console.log(`🗑️ Deleted user: ${user.email}`);
          deleted++;
        }
      } else {
        console.log(`🔒 Kept user: ${user.email}`);
      }
    }
    console.log(`\n✅ Deleted ${deleted} test users.`);
    // Pulisci la tabella clients
    console.log('🧹 Cleaning clients table...');
    const { error: clientsError } = await supabaseAdmin.from('clients').delete().neq('user_id', '');
    if (clientsError) {
      console.error('❌ Error cleaning clients table:', clientsError.message);
    } else {
      console.log('✅ Clients table cleaned.');
    }
    return true;
  } catch (error) {
    console.error('❌ Error deleting test users:', error.message);
    return false;
  }
}

deleteTestUsers().then(success => {
  if (success) {
    console.log('\n🎉 Test users cleanup completed!');
    console.log('💡 Ora puoi riprovare la registrazione tra qualche minuto.');
  } else {
    console.log('\n❌ Test users cleanup failed.');
  }
  process.exit(success ? 0 : 1);
}); 