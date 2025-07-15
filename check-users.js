require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    console.log('👥 Checking existing users...');
    
    // Check auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError.message);
      return false;
    }
    
    console.log('📊 Auth Users:', authUsers?.users?.length || 0);
    
    if (authUsers?.users && authUsers.users.length > 0) {
      console.log('📋 Auth Users List:');
      authUsers.users.forEach(user => {
        console.log(`  - ${user.email} (${user.id}) - Created: ${user.created_at}`);
      });
    }
    
    // Check clients table
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*');
    
    if (clientsError) {
      console.error('❌ Error listing clients:', clientsError.message);
      return false;
    }
    
    console.log('\n📊 Clients:', clients?.length || 0);
    
    if (clients && clients.length > 0) {
      console.log('📋 Clients List:');
      clients.forEach(client => {
        console.log(`  - ${client.first_name} ${client.last_name} (${client.user_id})`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    return false;
  }
}

checkUsers().then(success => {
  if (success) {
    console.log('\n✅ User check completed successfully!');
  } else {
    console.log('\n❌ User check failed.');
  }
  process.exit(success ? 0 : 1);
}); 