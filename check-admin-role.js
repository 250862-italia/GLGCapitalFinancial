require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminRole() {
  try {
    console.log('🔍 Checking admin role...');
    
    const adminId = '95971e18-ff4f-40e6-9aae-5e273671d20b';
    
    const { data: adminUser, error } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, last_name')
      .eq('id', adminId)
      .single();
    
    if (error) {
      console.log('❌ Error fetching admin:', error);
      return;
    }
    
    if (!adminUser) {
      console.log('❌ Admin not found');
      return;
    }
    
    console.log('✅ Admin found:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Name:', adminUser.first_name, adminUser.last_name);
    
    // Update admin role if needed
    if (adminUser.role !== 'super_admin' && adminUser.role !== 'admin') {
      console.log('🔄 Updating admin role to super_admin...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', adminId);
      
      if (updateError) {
        console.log('❌ Error updating role:', updateError);
      } else {
        console.log('✅ Admin role updated to super_admin');
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkAdminRole(); 